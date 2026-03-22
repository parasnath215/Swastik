# Local Network Deployment Guide

This guide explains how to run your `Sri Swastik` project on your laptop so that it acts as a server. This will allow other devices (like phones, tablets, or other PCs) connected to your same WiFi router or local network to access the application.

## 1. Network Auto-Configuration Applied

I have already updated your frontend code to automatically detect your laptop's IP address. 
- **File Changed:** `frontend/src/lib/api.ts`
- **What Changed:** Instead of hardcoding the backend URL to `localhost`, it now uses `window.location.hostname`. This ensures that when a phone accesses your laptop's IP, the phone will also know to request data from your laptop's IP instead of its own localhost.

---

## 2. Find Your Laptop's Local IP Address

Your local IP address right now is **`192.168.137.92`** *(from the Wi-Fi adapter)*.
*(Note: If you reconnect to a different WiFi network or restart your router, your IP might change. You can always check it again by opening PowerShell and typing `ipconfig` and looking for "IPv4 Address" under your active connection).*

---

## 3. Run the Backend Server

The backend needs to be accessible on your network. Node.js usually binds to all network interfaces (`0.0.0.0`) by default, so you just need to start it normally.

1. Open a new terminal in VS Code.
2. Navigate to the backend folder:
   ```bash
   cd e:\Swastik\backend
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *Your backend is now running on port 5000.*

---

## 4. Run the Frontend Server (Host Mode)

Vite (your frontend tool) protects your server by default by only allowing access from the exact same machine (`localhost`). You need to tell it to "host" to the network.

1. Open a **second** terminal in VS Code.
2. Navigate to the frontend folder:
   ```bash
   cd e:\Swastik\frontend
   ```
3. Start the dev server with the `--host` flag:
   ```bash
   npm run dev -- --host
   ```
   *(Note: The extra `--` is required so npm passes the flag to vite).*

You will see output in the terminal that looks like this:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.137.92:5173/
```

---

## 5. Accessing the App from Other Devices

1. Make sure your other device (phone, tablet, etc.) is connected to the **same Wi-Fi network** as your laptop.
2. Open a web browser on that device.
3. Type in the Network URL shown in your frontend terminal. Based on your current IP, it should be:
   **`http://192.168.137.92:5173`**

---

## 6. Important: Windows Firewall (If it doesn't load)

If your phone just spins and says "Site cannot be reached", Windows Firewall is blocking the connections. You need to allow the ports.

**The Easy Way (When Windows prompts you):**
When you first run `npm run dev -- --host` or start the backend, Windows might pop up a Defender Firewall window asking if "Node.js" should be allowed to communicate on private networks. **Check the box for Private Networks and click Allow Access.**

**The Manual Way:**
1. Press the Windows Key, type **Windows Defender Firewall with Advanced Security** and hit Enter.
2. Click **Inbound Rules** on the left.
3. Click **New Rule...** on the right.
4. Choose **Port** -> Next.
5. Choose **TCP** and Specific local ports: `5173, 5000` -> Next.
6. Choose **Allow the connection** -> Next.
7. Check Domain, Private, and Public -> Next.
8. Name it `Sri Swastik Local Server` -> Finish.

Now your phone should instantly connect!
