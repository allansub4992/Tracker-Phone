const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'locations.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initialize data file if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ devices: {} }, null, 2));
}

// Helper functions
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { devices: {} };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API: Receive location from tracker
app.post('/api/location', (req, res) => {
    const { deviceId, deviceName, latitude, longitude, accuracy, battery, timestamp } = req.body;

    if (!deviceId || !latitude || !longitude) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = readData();

    if (!data.devices[deviceId]) {
        data.devices[deviceId] = {
            name: deviceName || 'Unknown Device',
            locations: []
        };
    }

    // Update device name if provided
    if (deviceName) {
        data.devices[deviceId].name = deviceName;
    }

    // Add new location
    const locationEntry = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        battery: battery ? parseFloat(battery) : null,
        timestamp: timestamp || new Date().toISOString()
    };

    data.devices[deviceId].locations.push(locationEntry);
    data.devices[deviceId].lastSeen = locationEntry.timestamp;
    data.devices[deviceId].lastLocation = locationEntry;

    // Keep only last 1000 locations per device
    if (data.devices[deviceId].locations.length > 1000) {
        data.devices[deviceId].locations = data.devices[deviceId].locations.slice(-1000);
    }

    writeData(data);

    console.log(`📍 Location received from ${deviceName || deviceId}: ${latitude}, ${longitude}`);

    res.json({ success: true, message: 'Location saved' });
});

// API: Get all devices with their last location
app.get('/api/devices', (req, res) => {
    const data = readData();
    const devices = Object.entries(data.devices).map(([id, device]) => ({
        id,
        name: device.name,
        lastSeen: device.lastSeen,
        lastLocation: device.lastLocation
    }));
    res.json(devices);
});

// API: Get location history for a device
app.get('/api/devices/:deviceId/history', (req, res) => {
    const { deviceId } = req.params;
    const { limit = 100 } = req.query;

    const data = readData();
    const device = data.devices[deviceId];

    if (!device) {
        return res.status(404).json({ error: 'Device not found' });
    }

    const locations = device.locations.slice(-parseInt(limit));

    res.json({
        deviceId,
        name: device.name,
        locations
    });
});

// API: Delete device
app.delete('/api/devices/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const data = readData();

    if (data.devices[deviceId]) {
        delete data.devices[deviceId];
        writeData(data);
        res.json({ success: true, message: 'Device deleted' });
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

// API: Clear history for a device
app.delete('/api/devices/:deviceId/history', (req, res) => {
    const { deviceId } = req.params;
    const data = readData();

    if (data.devices[deviceId]) {
        data.devices[deviceId].locations = [];
        writeData(data);
        res.json({ success: true, message: 'History cleared' });
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

// Serve tracker page
app.get('/tracker', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tracker.html'));
});

// Serve dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║           🛰️  LOCATION TRACKER SERVER                   ║
╠══════════════════════════════════════════════════════════╣
║  Server running on port ${PORT}                            ║
║                                                          ║
║  📍 Dashboard:  http://localhost:${PORT}/                  ║
║  📱 Tracker:    http://localhost:${PORT}/tracker           ║
╚══════════════════════════════════════════════════════════╝
    `);
});
