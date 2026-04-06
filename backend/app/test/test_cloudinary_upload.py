import os
import requests
from PIL import Image, ImageDraw
import uuid
from core import setting

# --- User Configuration ---
# Please fill in your details here
BASE_URL = "http://localhost:8000"  # Or your specific server URL
EMAIL = setting.EMAIL  # Your registered email
PASSWORD = setting.PASSWORD  # Your password
# --------------------------


def get_auth_token(email, password):
    """Authenticate and return the JWT token and user ID."""
    print("1. Authenticating...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": email, "password": password},
    )
    response.raise_for_status()
    token_data = response.json()
    access_token = token_data["access_token"]
    print("   Authenticated successfully.")

    print("1.1. Fetching user ID from token...")
    import base64
    import json

    jwt_payload = access_token.split(".")[1]
    # fix the padding
    jwt_payload += "=" * ((4 - len(jwt_payload) % 4) % 4)
    decoded_payload = base64.b64decode(jwt_payload).decode("utf-8")
    payload_json = json.loads(decoded_payload)
    user_id = payload_json["userId"]
    print(f"   Fetched user ID: {user_id}")

    return access_token, user_id


def get_latest_session(token):
    """Fetch the most recent session ID."""
    print("2. Fetching latest session...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/session/", headers=headers)
    response.raise_for_status()
    sessions = response.json()
    if not sessions:
        raise Exception(
            "No sessions found for the user. Please create a session first."
        )
    latest_session_id = sessions[0]["id"]
    print(f"   Found session ID: {latest_session_id}")
    return latest_session_id


def get_any_fish(token):
    """Fetch the ID of the first fish."""
    print("3. Fetching a fish...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/fish/", headers=headers)
    response.raise_for_status()
    fish = response.json()
    if not fish:
        raise Exception("No fish found. Please seed the fish data.")
    fish_id = fish[0]["id"]
    print(f"   Found fish ID: {fish_id}")
    return fish_id


def create_catch(token, user_id, session_id, fish_id):
    """Create a new catch and return its ID."""
    print("4. Creating a new catch...")
    headers = {"Authorization": f"Bearer {token}"}
    catch_data = {
        "user_id": user_id,
        "session_id": session_id,
        "fish_id": fish_id,
        "weight": 1.5,
        "free_text": "Test catch from script",
    }
    response = requests.post(f"{BASE_URL}/api/catch/", headers=headers, json=catch_data)
    response.raise_for_status()
    catch_id = response.json()
    print(f"   Catch created with ID: {catch_id}")
    return catch_id


def create_demo_image():
    """Create a simple demo image and save it."""
    print("5. Generating demo image...")
    img = Image.new("RGB", (100, 100), color="blue")
    draw = ImageDraw.Draw(img)
    draw.text((10, 10), "Test Image")
    image_path = "demo_image.png"
    img.save(image_path)
    print(f"   Demo image saved as {image_path}")
    return image_path


def upload_catch_media(token, catch_id, image_path):
    """Upload the image to the specified catch."""
    print("6. Uploading image to Cloudinary...")
    headers = {"Authorization": f"Bearer {token}"}
    with open(image_path, "rb") as f:
        files = {"file": (image_path, f, "image/png")}
        response = requests.post(
            f"{BASE_URL}/api/catch/{catch_id}/media", headers=headers, files=files
        )

    response.raise_for_status()
    media_id = response.json()
    print(f"   Media uploaded successfully. Media ID: {media_id}")
    return media_id


def get_catch_details(token, catch_id):
    """Get the details of the catch, including media."""
    print("7. Verifying upload...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/catch/", headers=headers)
    response.raise_for_status()
    catches = response.json()
    for catch in catches:
        if catch["id"] == catch_id:
            print("   Found uploaded media URL:")
            print(f"   >>> {catch['media'][0]['file_url']} <<<")
            return
    print("   Could not find the uploaded media URL in the catch details.")


if __name__ == "__main__":
    try:
        # Step 1: Authenticate
        token, user_id = get_auth_token(EMAIL, PASSWORD)

        # Step 2: Get prerequisites
        session_id = get_latest_session(token)
        fish_id = get_any_fish(token)

        # Step 3: Create a catch
        catch_id = create_catch(token, user_id, session_id, fish_id)

        # Step 4: Create a demo image
        image_path = create_demo_image()

        # Step 5: Upload the image
        upload_catch_media(token, catch_id, image_path)

        # Step 6: Verify by fetching the catch details
        get_catch_details(token, catch_id)

    except requests.exceptions.RequestException as e:
        print(f"ERROR: An API request failed: {e}")
        if e.response is not None:
            print(f"Response: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Clean up the demo image
        if os.path.exists("demo_image.png"):
            os.remove("demo_image.png")
            print("8. Cleaned up demo image.")
