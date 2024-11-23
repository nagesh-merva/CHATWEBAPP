import gevent.monkey
gevent.monkey.patch_all()

from datetime import datetime
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, send, emit
from together import Together
from flask_cors import CORS
from pymongo import MongoClient
import os

# Initialize Flask and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
CORS(app,cors_allowed_origins="*", supports_credentials=True, allow_headers="*", origins="*", methods=["OPTIONS", "POST"])
socketio = SocketIO(app, cors_allowed_origins="*")

AIclient = Together(api_key="f8c8fa4fd70a01169d90a949a82246470d2d0e5620e80f026b4ea7453764598e")

client = MongoClient(
    'mongodb+srv://nagesh:nagesh2245@mywebsites.btvk61i.mongodb.net/',
    connectTimeoutMS = 20000,
    socketTimeoutMS=20000
)

DB = client['CHATAPP']
MESSAGE_COLC = DB['MESSAGES-DATABASE']
User_COLC = DB['Users']
ActiveUsers_COLC = DB['ActiveUsers'] 

@app.route('/api/register', methods=['POST'])
def register_newuser():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success', 'message': 'CORS preflight request handled successfully'}), 200
    
    data = request.json
    username = data['username']
    username = username.lower()
    email = data['email']
    password = data['password']
    
    Userexists = User_COLC.find_one({'username' :username})
    if Userexists:
        return {"message" : "user already exists, please try some other username"}, 400
    else:
        User_COLC.insert_one({"username":username, "password":password, "email":email})
    return {"message": "User  registered successfully"}, 200

@socketio.on('login_request')
def handle_login(data):
    username = data['username']
    username = username.lower()
    password = data['password']
    client_id = request.sid
    
    user = User_COLC.find_one({'username': username})
    
    if user and (user['password'] == password):
        active_user = ActiveUsers_COLC.find_one({"username": username})
        if not active_user:
            ActiveUsers_COLC.insert_one({
                "ClientId": client_id,
                "username": username,
                "connection_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
        socketio.emit('login_response', {'success': True, 'message': 'Login successful!'})
    else:
        socketio.emit('login_response', {'success': False, 'message': 'Invalid username or password.'})

@socketio.on('connect')
def handle_connect():
    username = request.args.get('username')
    client_id = request.sid
    print(f"Client {client_id} connected")

    messages = list(MESSAGE_COLC.find().sort('_id', -1).limit(100))
    if username:
        print(f"User {username} connected with session ID {client_id}")

        # Add to ActiveUsers collection if not already present
        active_user = ActiveUsers_COLC.find_one({"username":username})
        if not active_user:
            ActiveUsers_COLC.insert_one({
                "ClientId": client_id,
                "username": username,
                "connection_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
    
    formatted_messages = [{'id': message['id'],'text': message['text'], 'sender': message['sender'], 'status':'delivered' ,'timestamp': message['timestamp']} for message in messages]
    
    emit('allmsgs', formatted_messages)
    
# Handle incoming messages from the client
@socketio.on('message')
def handle_message(data):
    message_data = {
        'id' : data['id'],
        'text': data['text'],
        'sender': data['sender'],
        'status' : data['status'],
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    Dupmsg = MESSAGE_COLC.find_one({"id" : message_data['id']})
    if Dupmsg:
        return
    MESSAGE_COLC.insert_one(message_data)
    print(f"Message received: {data}")
    # Acknowledge receipt of the message to the sender
    emit('message', {'id': data['id'],'text': data['text'], 'sender': data['sender'], 'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, broadcast=True)
    # Send acknowledgment to the sender only
    emit('message_received', {'id': data['id'],'text': data['text'], 'sender': data['sender'], 'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, callback=lambda: print("Ack sent"))

@socketio.on('aimessage')
def handle_Aiask(data):
    message_data = {
        'id' : data['id'],
        'text': data['text'],
        'sender': data['sender'],
        'status' : data['status'],
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    Dupmsg = MESSAGE_COLC.find_one({"id" : message_data['id']})
    if Dupmsg:
        return
    
    if message_data['text']:
        prompt = message_data['text'] + ". [Please remember to keep your response under 50 words if not as mentioned prior, but the strict limit is 121 words **DO NOT CROSS THIS Limit**]"
        print(prompt)
    
        response = AIclient.chat.completions.create(
            model="meta-llama/Llama-3-8b-chat-hf",
            messages=[{"role": "user", "content": f"{prompt}"}],
        )
        
        if response.choices:
            response_text = response.choices[0].message.content
        else:
            response_text = "No response generated"

    message_data['text'] = f"{message_data['text']} \n\n {response_text}"

    MESSAGE_COLC.insert_one(message_data)
    print(f"Message received: {data}")
    # Acknowledge receipt of the message to the sender
    emit('message', {'id': message_data['id'],'text': message_data['text'], 'sender': message_data['sender'], 'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, broadcast=True)
    # Send acknowledgment to the sender only
    emit('aimessage_received', {'id': message_data['id'],'text': message_data['text'], 'sender': message_data['sender'], 'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, callback=lambda: print("Ack sent"))

# Handle client disconnections
@socketio.on('disconnect')
def handle_disconnect():
    client_id = request.sid
    print(f"Client {client_id} disconnected.")
    try:
        user = ActiveUsers_COLC.find_one_and_delete({"ClientId": client_id})
        if user:
            print(f"Removed {user['username']} from active users.")
        else:
            print(f"No active user found for ClientId: {client_id}.")
    except Exception as e:
        print(f"Error while removing active user: {str(e)}")

        
@app.route('/api/active_users', methods=['GET'])
def get_active_users():
    try:
        active_users = list(ActiveUsers_COLC.find({}, {"_id": 0, "username": 1}))
        return jsonify({"activeUsers": active_users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=8080)
