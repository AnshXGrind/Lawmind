"""
AES-256 Encryption Service for Legal Documents
Provides secure encryption/decryption for sensitive legal content
"""

import base64
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from typing import Tuple

class EncryptionService:
    """Handle AES-256 encryption for legal documents"""
    
    def __init__(self):
        self.backend = default_backend()
        self.block_size = 128  # AES block size in bits
        
    def generate_key(self) -> bytes:
        """Generate a random 256-bit encryption key"""
        return os.urandom(32)  # 32 bytes = 256 bits
    
    def generate_iv(self) -> bytes:
        """Generate a random initialization vector"""
        return os.urandom(16)  # 16 bytes = 128 bits
    
    def encrypt_text(self, plaintext: str, key: bytes) -> Tuple[str, str]:
        """
        Encrypt plaintext using AES-256-CBC
        
        Args:
            plaintext: Text to encrypt
            key: 32-byte encryption key
            
        Returns:
            Tuple of (encrypted_data_base64, iv_base64)
        """
        try:
            # Generate random IV
            iv = self.generate_iv()
            
            # Convert plaintext to bytes
            plaintext_bytes = plaintext.encode('utf-8')
            
            # Apply PKCS7 padding
            padder = padding.PKCS7(self.block_size).padder()
            padded_data = padder.update(plaintext_bytes) + padder.finalize()
            
            # Create cipher and encrypt
            cipher = Cipher(
                algorithms.AES(key),
                modes.CBC(iv),
                backend=self.backend
            )
            encryptor = cipher.encryptor()
            encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
            
            # Encode to base64 for storage
            encrypted_base64 = base64.b64encode(encrypted_data).decode('utf-8')
            iv_base64 = base64.b64encode(iv).decode('utf-8')
            
            return encrypted_base64, iv_base64
            
        except Exception as e:
            raise ValueError(f"Encryption failed: {str(e)}")
    
    def decrypt_text(self, encrypted_base64: str, key: bytes, iv_base64: str) -> str:
        """
        Decrypt encrypted text using AES-256-CBC
        
        Args:
            encrypted_base64: Base64-encoded encrypted data
            key: 32-byte encryption key
            iv_base64: Base64-encoded initialization vector
            
        Returns:
            Decrypted plaintext string
        """
        try:
            # Decode from base64
            encrypted_data = base64.b64decode(encrypted_base64)
            iv = base64.b64decode(iv_base64)
            
            # Create cipher and decrypt
            cipher = Cipher(
                algorithms.AES(key),
                modes.CBC(iv),
                backend=self.backend
            )
            decryptor = cipher.decryptor()
            padded_plaintext = decryptor.update(encrypted_data) + decryptor.finalize()
            
            # Remove PKCS7 padding
            unpadder = padding.PKCS7(self.block_size).unpadder()
            plaintext_bytes = unpadder.update(padded_plaintext) + unpadder.finalize()
            
            # Convert to string
            plaintext = plaintext_bytes.decode('utf-8')
            
            return plaintext
            
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
    
    def encrypt_draft_content(self, content: str, user_key: str) -> Tuple[str, str]:
        """
        Encrypt draft content using user's encryption key
        
        Args:
            content: Draft content to encrypt
            user_key: User's encryption key (32-char hex string)
            
        Returns:
            Tuple of (encrypted_content_base64, iv_base64)
        """
        # Convert hex key to bytes
        key_bytes = bytes.fromhex(user_key)
        
        if len(key_bytes) != 32:
            raise ValueError("Encryption key must be 32 bytes (256 bits)")
        
        return self.encrypt_text(content, key_bytes)
    
    def decrypt_draft_content(self, encrypted_content: str, user_key: str, iv: str) -> str:
        """
        Decrypt draft content using user's encryption key
        
        Args:
            encrypted_content: Base64-encoded encrypted content
            user_key: User's encryption key (32-char hex string)
            iv: Base64-encoded initialization vector
            
        Returns:
            Decrypted draft content
        """
        # Convert hex key to bytes
        key_bytes = bytes.fromhex(user_key)
        
        if len(key_bytes) != 32:
            raise ValueError("Encryption key must be 32 bytes (256 bits)")
        
        return self.decrypt_text(encrypted_content, key_bytes, iv)
    
    def generate_user_key(self) -> str:
        """
        Generate a new encryption key for a user
        
        Returns:
            64-character hex string (32 bytes = 256 bits)
        """
        key = self.generate_key()
        return key.hex()

# Singleton instance
encryption_service = EncryptionService()
