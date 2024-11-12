from datetime import datetime
from flask import Flask
from flask_socketio import SocketIO, send, emit
from pymongo import MongoClient

# Initialize Flask and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

client = MongoClient(
    'mongodb+srv://nagesh:nagesh2245@mywebsites.btvk61i.mongodb.net/',
    connectTimeoutMS = 3000,
    socketTimeoutMS=None
)

DB = client['CHATAPP']
MESSAGE_COLC = DB['MESSAGES-DATABASE']

@socketio.on('connect')
def handle_connect():
    print("Client connected")
    
    messages = list(MESSAGE_COLC.find().sort('_id', -1).limit(100))
    
    formatted_messages = [{'text': message['text'], 'sender': message['sender'], 'status':'delivered' ,'timestamp': message['timestamp']} for message in messages]
    
    emit('allmsgs', formatted_messages)

# Handle when a new user joins
@socketio.on('user_joined')
def handle_user_joined(username):
    join_message = f"{username} has joined the chat"
    print(join_message)
    send({'text': join_message, 'sender': 'Server','timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, broadcast=True)
    
# Handle incoming messages from the client
@socketio.on('message')
def handle_message(data):
    message_data = {
        'text': data['text'],
        'sender': data['sender'],
        'status' : data['status'],
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    MESSAGE_COLC.insert_one(message_data)
    print(f"Message received: {data}")
    # Acknowledge receipt of the message to the sender
    emit('message', {'text': data['text'], 'sender': data['sender'], 'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, broadcast=True)
    # Send acknowledgment to the sender only
    emit('message_received', {'text': data['text'], 'sender': data['sender'], 'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, callback=lambda: print("Ack sent"))

# Handle client disconnections
@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

if __name__ == "__main__":
    # Use eventlet for handling multiple clients
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)
