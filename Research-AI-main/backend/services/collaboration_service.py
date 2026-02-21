import json
import os
import uuid
from datetime import datetime

ROOMS_FILE = 'rooms.json'

class CollaborationService:
    def __init__(self):
        self.rooms_file = ROOMS_FILE
        self.rooms = self._load_rooms()

    def _load_rooms(self):
        if os.path.exists(self.rooms_file):
            with open(self.rooms_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_rooms(self):
        with open(self.rooms_file, 'w') as f:
            json.dump(self.rooms, f, indent=4)

    def create_room(self, name):
        room_id = str(uuid.uuid4())
        self.rooms[room_id] = {
            "name": name,
            "created_at": str(datetime.now()),
            "messages": []
        }
        self._save_rooms()
        return room_id

    def get_room(self, room_id):
        return self.rooms.get(room_id)

    def add_message(self, room_id, user, content):
        if room_id in self.rooms:
            message = {
                "user": user,
                "content": content,
                "timestamp": str(datetime.now())
            }
            self.rooms[room_id]["messages"].append(message)
            self._save_rooms()
            return message
        return None

    def get_messages(self, room_id):
        if room_id in self.rooms:
            return self.rooms[room_id]["messages"]
        return []

    def list_rooms(self):
        return [{"id": rid, "name": data["name"], "created_at": data.get("created_at")} for rid, data in self.rooms.items()]
