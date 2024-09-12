const AWS = require('aws-sdk');

class SageMakerService {
  constructor() {
    // Initialize AWS SDK configuration
    AWS.config.update({
      region: 'eu-west-1', // Ensure this matches your endpoint's region
      credentials: new AWS.Credentials('*****', '****', '*****') // Optional if credentials are set up elsewhere
    });


    // Initialize SageMakerRuntime
    this.sagemakerRuntime = new AWS.SageMakerRuntime();

    // Set default endpoint name
    this.endpointName = 'realestate-classification-final-dataset-v1-endpoint'; // Replace with your endpoint name
  }

  /**
   * Method to invoke the SageMaker endpoint with an image in Base64 format.
   * @param {string} base64Image - The image in Base64 format.
   * @returns {Promise<Object>} - The result from the SageMaker endpoint.
   */
  async invokeEndpoint(base64Image) {
    // Decode Base64 image data to binary
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Parameters for SageMaker invocation
    const params = {
      EndpointName: this.endpointName,
      Body: imageBuffer,
      ContentType: 'application/x-image', // Adjust content type if needed
      Accept: 'application/json;verbose',
    };

    try {
      // Call SageMaker endpoint
      const response = await this.sagemakerRuntime.invokeEndpoint(params).promise();
      const result = JSON.parse(Buffer.from(response.Body).toString('utf-8'));
      console.log(result);
      return result;
    } catch (error) {
      console.error('Error invoking SageMaker endpoint:', error);
      throw new Error('Error invoking SageMaker endpoint');
    }
  }
}

module.exports = SageMakerService;
