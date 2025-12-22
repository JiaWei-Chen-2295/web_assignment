import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;
const REAL_API_URL = 'https://api.xiaomimimo.com/v1';

app.use(cors());
app.use(express.json());

// Proxy all requests to the real API
app.all('/api/*', async (req, res) => {
  try {
    const path = req.path.replace('/api', '');
    const url = REAL_API_URL + path;
    
    const config = {
      method: req.method,
      url: url,
      headers: {
        ...req.headers,
        'host': new URL(REAL_API_URL).host,
      },
      data: req.body,
    };
    
    // Remove host and content-length to let axios set them
    delete config.headers['host'];
    delete config.headers['content-length'];
    delete config.headers['origin'];
    delete config.headers['referer'];
    
    const response = await axios(config);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: error.message };
    res.status(status).send(data);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`Forwarding requests to ${REAL_API_URL}`);
});
