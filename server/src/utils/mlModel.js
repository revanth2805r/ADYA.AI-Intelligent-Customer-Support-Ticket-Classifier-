// src/utils/mlModel.js
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Python script - adjust if your Python script is in a different location
const PYTHON_SCRIPT_PATH = path.join(__dirname, '../../ml/predict.py');
const PYTHON_EXECUTABLE = 'python'; // or 'python3' depending on your system

const analyzeMessage = async (message) => {
  return new Promise((resolve, reject) => {
    // Sanitize the message to prevent command injection
    const sanitizedMessage = message.replace(/["\\]/g, '\\$&');
    
    // Spawn a Python process
    const pythonProcess = spawn(PYTHON_EXECUTABLE, [
      PYTHON_SCRIPT_PATH, 
      sanitizedMessage
    ]);
    
    let result = '';
    let errorOutput = '';

    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    // Collect any error output
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`Error output: ${errorOutput}`);
        return reject(new Error(`ML model analysis failed with code ${code}: ${errorOutput}`));
      }

      try {
        // Parse the JSON output from the Python script
        const analysis = JSON.parse(result);
        
        // Map the Python model outputs to the expected format in your Node.js app
        const mappedAnalysis = {
          category: analysis.queue,          // Map 'queue' to 'category'
          priority: convertPriorityToNumber(analysis.priority), // Convert priority to number
          sentiment: analysis.sentiment      // Keep sentiment as is
        };
        
        resolve(mappedAnalysis);
      } catch (error) {
        console.error('Error parsing Python output:', error);
        console.error('Raw output:', result);
        reject(error);
      }
    });
  });
};

// Helper function to convert priority string to number
function convertPriorityToNumber(priorityString) {
  const priorityMap = {
    'low': 0,
    'medium': 1,
    'high': 2,
    'urgent': 3
  };
  
  return priorityMap[priorityString.toLowerCase()] || 0;
}

export default { analyzeMessage };