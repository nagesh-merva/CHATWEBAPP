from flask import Flask
from flask_socketio import SocketIO, send, emit

# Initialize Flask and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Handle incoming connections
@socketio.on('connect')
def handle_connect():
    print("Client connected")

# Handle when a new user joins
@socketio.on('user_joined')
def handle_user_joined(username):
    join_message = f"{username} has joined the chat"
    print(join_message)
    send({'text': join_message, 'sender': 'Server'}, broadcast=True)
    
# Handle incoming messages from the client
@socketio.on('message')
def handle_message(data):
    print(f"Message received: {data}")
    # Broadcast the message to all connected clients
    send({'text': data['text'], 'sender': data['sender']}, broadcast=True)

# Handle client disconnections
@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

if __name__ == "__main__":
    # Use eventlet for handling multiple clients
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)
