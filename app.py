import streamlit as st
import requests

st.set_page_config(page_title="LawMind UI", page_icon="⚖️")

st.title("LawMind - AI-Powered Indian Legal Assistant")
st.write("This Streamlit frontend connects to the LawMind backend.")

# You can add your Streamlit code here to interact with the backend API
# For example:
# backend_url = "http://localhost:8000"
# response = requests.get(f"{backend_url}/health")
# st.json(response.json())
