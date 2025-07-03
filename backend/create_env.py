import os

# Create .env file with proper UTF-8 encoding
env_content = """SECRET_KEY=your-secret-key-here-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$Tv1Rh29sZILhG7YQuNjev.tIai8hoj86s.ZO5IrVgwo6Twpm76piS
"""

# Write the file with UTF-8 encoding
with open('.env', 'w', encoding='utf-8') as f:
    f.write(env_content)

print("✅ .env file created successfully!")
print("File contents:")
with open('.env', 'r', encoding='utf-8') as f:
    print(f.read()) 