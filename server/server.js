const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const SageMakerService = require('./sageMakerService'); // Import the SageMakerService class

const app = express();
const port = 3003;

const sageMakerService = new SageMakerService();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/api/invoke-sagemaker', async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'No imageBase64 provided' });
  }

  try {
    const result = await sageMakerService.invokeEndpoint(imageBase64);


    // console.log(result);


    res.json(result);
  } catch (error) {
    console.error('Error invoking SageMaker:', error.message);
    res.status(500).json({ error: 'Failed to invoke SageMaker endpoint' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
