#!/usr/bin/env node

const API_KEY = 'sk-agb-0ea8da6c72ae31a6294d790c711260bb096a9ddf3af299c7b3017b7b51a3e98a';
const API_URL = 'https://api.agentbase.sh';

// Test scenarios to run
const testScenarios = [
  {
    name: 'Simple Chat - No Computer',
    message: 'Hello! Can you explain what machine learning is in simple terms?',
    computer: false,
    category: 'simple_text'
  },
  {
    name: 'Text Summarization',
    message: 'Summarize this text: "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task. It involves algorithms that can identify patterns, make predictions, and improve their performance over time through experience."',
    computer: false,
    category: 'simple_text'
  },
  {
    name: 'Web Search - Information Retrieval',
    message: 'Search for the latest news about artificial intelligence developments in 2024 and summarize the top 3 findings.',
    computer: true,
    category: 'web_search'
  },
  {
    name: 'Web Crawling Analysis',
    message: 'Visit the homepage of OpenAI and analyze what their main product offerings are.',
    computer: true,
    category: 'web_crawl'
  },
  {
    name: 'File Operations',
    message: 'Create a simple Python script that calculates the factorial of a number and save it to a file.',
    computer: true,
    category: 'file_ops'
  },
  {
    name: 'Complex Multi-step Workflow',
    message: 'Research the top 3 programming languages trending in 2024, create a comparison table of their features, save it to a CSV file, and then create a Python script that reads the CSV and generates a summary report.',
    computer: true,
    category: 'complex_workflow'
  }
];

// Modes to test
const modes = ['fast', 'flash', 'max'];

// Function to make API call and handle streaming response
async function makeAPICall(message, mode, computer = false) {
  const payload = {
    message: message,
    mode: mode
  };
  
  if (computer) {
    payload.computer = true;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = [];
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim() === '' || line.startsWith(':')) continue;
        
        if (line.startsWith('data: ')) {
          const data = line.substring(6).trim();
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            result.push(parsed);
          } catch (e) {
            console.log('Failed to parse line:', data);
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
}

// Function to extract cost information from response
function extractCostInfo(response) {
  if (!response) return null;
  
  // Look for cost information in the response
  // Based on the pricing page, cost info should be in agent_cost type
  if (response.type === 'agent_cost') {
    return {
      cost: parseFloat(response.cost),
      balance: parseFloat(response.balance),
      session: response.session
    };
  }
  
  // If it's an array of responses, look for cost info
  if (Array.isArray(response)) {
    for (const item of response) {
      if (item.type === 'agent_cost') {
        return {
          cost: parseFloat(item.cost),
          balance: parseFloat(item.balance),
          session: item.session
        };
      }
    }
  }
  
  return null;
}

// Main testing function
async function runPricingTests() {
  console.log('🚀 Starting Agentbase API Pricing Tests\n');
  
  const results = [];
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log(`Category: ${scenario.category}`);
    console.log(`Computer: ${scenario.computer ? 'Yes' : 'No'}`);
    console.log('─'.repeat(50));
    
    for (const mode of modes) {
      console.log(`\n🔄 Mode: ${mode.toUpperCase()}`);
      
      const startTime = Date.now();
      const response = await makeAPICall(scenario.message, mode, scenario.computer);
      const endTime = Date.now();
      
      if (response) {
        const costInfo = extractCostInfo(response);
        
        const result = {
          scenario: scenario.name,
          category: scenario.category,
          mode: mode,
          computer: scenario.computer,
          response_time: endTime - startTime,
          cost_info: costInfo,
          raw_response: response
        };
        
        results.push(result);
        
        if (costInfo) {
          console.log(`💰 Cost: $${costInfo.cost}`);
          console.log(`💳 Remaining Balance: $${costInfo.balance}`);
        } else {
          console.log('⚠️  No cost information found in response');
        }
        
        console.log(`⏱️  Response Time: ${endTime - startTime}ms`);
      } else {
        console.log('❌ API call failed');
      }
      
      // Wait 2 seconds between calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `agentbase-pricing-results-${timestamp}.json`;
  
  require('fs').writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to ${filename}`);
  
  // Generate summary
  generateSummary(results);
}

// Function to generate summary of results
function generateSummary(results) {
  console.log('\n📊 PRICING ANALYSIS SUMMARY');
  console.log('═'.repeat(60));
  
  const summaryByMode = {};
  const summaryByCategory = {};
  
  results.forEach(result => {
    if (!result.cost_info) return;
    
    const { mode, category, computer, cost_info } = result;
    const cost = cost_info.cost;
    
    // Group by mode
    if (!summaryByMode[mode]) {
      summaryByMode[mode] = { costs: [], total: 0, count: 0 };
    }
    summaryByMode[mode].costs.push(cost);
    summaryByMode[mode].total += cost;
    summaryByMode[mode].count++;
    
    // Group by category
    const categoryKey = `${category}_${computer ? 'computer' : 'no_computer'}`;
    if (!summaryByCategory[categoryKey]) {
      summaryByCategory[categoryKey] = { costs: [], total: 0, count: 0 };
    }
    summaryByCategory[categoryKey].costs.push(cost);
    summaryByCategory[categoryKey].total += cost;
    summaryByCategory[categoryKey].count++;
  });
  
  // Print mode summary
  console.log('\n🎯 COST BY MODE:');
  Object.entries(summaryByMode).forEach(([mode, data]) => {
    const avg = data.total / data.count;
    const min = Math.min(...data.costs);
    const max = Math.max(...data.costs);
    
    console.log(`${mode.toUpperCase()}:`);
    console.log(`  Average: $${avg.toFixed(4)}`);
    console.log(`  Range: $${min.toFixed(4)} - $${max.toFixed(4)}`);
    console.log(`  Total Steps: ${data.count}`);
  });
  
  // Print category summary
  console.log('\n🏷️  COST BY TASK CATEGORY:');
  Object.entries(summaryByCategory).forEach(([category, data]) => {
    const avg = data.total / data.count;
    const min = Math.min(...data.costs);
    const max = Math.max(...data.costs);
    
    console.log(`${category.toUpperCase()}:`);
    console.log(`  Average: $${avg.toFixed(4)}`);
    console.log(`  Range: $${min.toFixed(4)} - $${max.toFixed(4)}`);
    console.log(`  Total Steps: ${data.count}`);
  });
}

// Run the tests
if (require.main === module) {
  runPricingTests().catch(console.error);
}

module.exports = { makeAPICall, extractCostInfo, runPricingTests };