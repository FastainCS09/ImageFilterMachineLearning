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

      const topKProbabilities = this.getTopKProbabilities(result.labels, result.probabilities, 5);

      return {
        top_predicted_labels: topKProbabilities,
        accepted: (result.predicted_label !== 'unknown_type' && this.isFirstProbabilityGreaterThan40(topKProbabilities)),
      };
    } catch (error) {
      console.error('Error invoking SageMaker endpoint:', error);
      throw new Error('Error invoking SageMaker endpoint');
    }
  }

  isFirstProbabilityGreaterThan40(topKProbabilities) {
    if (!topKProbabilities || Object.keys(topKProbabilities).length === 0) {
      return false;
    }

    const firstKey = Object.keys(topKProbabilities)[0];
    const firstValue = parseFloat(topKProbabilities[firstKey]);

    return firstValue > 40;
  }

  get_sorted_probabilities(labels, probabilities) {
    const labelProbabilities = {};
    for (let i = 0; i < labels.length; i++) {
      labelProbabilities[this.getLabel(labels, i)] = (probabilities[i] * 100).toFixed(2) ;
    }
    return Object.fromEntries(
        Object.entries(labelProbabilities).sort(([, a], [, b]) => parseFloat(b) - parseFloat(a))
    );
  }

  getLabel(labels, i) {
    // Label mapping
    const labelMapping = {
      'unknown_type': 'unknown',
      'floor_plan:': 'floor plan',
      'property_facade': 'facade',
    };
    return labelMapping[labels[i]] || labels[i];
  }

  getTopKProbabilities(labels, probabilities, k) {
    const sortedLabelProbabilities = this.get_sorted_probabilities(labels, probabilities);
    const topK = Object.entries(sortedLabelProbabilities).slice(0, k);
    return Object.fromEntries(topK);
  }
}

module.exports = SageMakerService;
