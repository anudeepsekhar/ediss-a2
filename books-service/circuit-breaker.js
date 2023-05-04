const axios = require('axios');

// Set up initial state of circuit breaker
let circuitOpen = false;
let lastFailureTime = null;

// Constants for timeouts and thresholds
const TIMEOUT = 3000; // 3 seconds
const OPEN_THRESHOLD = 60000; // 60 seconds

// Function to make a request to the external service
async function makeRequest(ISBN) {
  try {
    const response = await axios.get(`{BASEURL}/books/${ISBN}/related-books`, { timeout: TIMEOUT });
    if (circuitOpen) {
      console.log('Circuit closed');
      circuitOpen = false;
      lastFailureTime = null;
    }
    return response.data;
  } catch (error) {
    console.error(error);
    if (error.code === 'ECONNABORTED') { // Timeout error
      if (!circuitOpen) {
        console.log('Circuit open');
        circuitOpen = true;
        lastFailureTime = new Date().getTime();
        return Promise.reject({ status: 504 });
      } else {
        const now = new Date().getTime();
        const timeSinceFailure = now - lastFailureTime;
        if (timeSinceFailure > OPEN_THRESHOLD) { // Time to try again
          try {
            const response = await axios.get(`{BASEURL}/books/${ISBN}/related-books`, { timeout: TIMEOUT });
            console.log('Circuit closed');
            circuitOpen = false;
            lastFailureTime = null;
            return response.data;
          } catch (error) {
            console.error(error);
            console.log('Circuit still open');
            return Promise.reject({ status: 503 });
          }
        } else { // Too soon to try again
          console.log('Circuit still open');
          return Promise.reject({ status: 503 });
        }
      }
    } else { // Other error
      return Promise.reject({ status: error.response.status });
    }
  }
}

module.exports = { makeRequest };