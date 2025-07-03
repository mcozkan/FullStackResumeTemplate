from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Generate hash for password "password"
password = "password"
hashed = pwd_context.hash(password)

print(f"Password: {password}")
print(f"Hash: {hashed}")

# Test verification
is_valid = pwd_context.verify(password, hashed)
print(f"Verification test: {is_valid}")

# Test with the current hash in .env
current_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO"
is_current_valid = pwd_context.verify(password, current_hash)
print(f"Current hash verification: {is_current_valid}") 