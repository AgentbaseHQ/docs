#!/usr/bin/env node

const API_KEY = 'sk-agb-0ea8da6c72ae31a6294d790c711260bb096a9ddf3af299c7b3017b7b51a3e98a';
const API_URL = 'https://api.agentbase.sh';

// Test scenarios
const testScenarios = [
  {
    name: 'Web Search Task',
    message: 'Search for the latest information about Claude 3.5 Sonnet and summarize the key features.',
    computer: true,
    category: 'web_search'
  },
  {
    name: 'Text Analysis (Larger Context)',
    message: 'Analyze this long text for key themes and sentiment: ' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(200),
    computer: false,
    category: 'large_context_text'
  },
  {
    name: 'Code Generation',
    message: 'Create a Python function that reads a CSV file, calculates statistics, and saves results to a new file.',
    computer: true,
    category: 'code_generation'
  },
  {
    name: 'Multi-step Complex Task',
    message: 'Research Python web scraping libraries, create a comparison table, write sample code for each, and save everything to organized files.',
    computer: true,
    category: 'complex_workflow'
  }
];

async function testAPI(message, mode, computer = false) {
  console.log(`🔄 Testing: ${mode.toUpperCase()} mode`);
  console.log(`💻 Computer: ${computer ? 'Yes' : 'No'}`);
  console.log(`📝 Message: ${message.substring(0, 100)}...`);
  
  const payload = {
    message: message,
    mode: mode
  };
  
  if (computer) {
    payload.computer = true;
  }

  try {
    const startTime = Date.now();
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
    let allData = [];
    let stepCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim() === '' || line.startsWith(':')) continue;
        
        if (line.startsWith('data: ')) {
          const data = line.substring(6).trim();
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            allData.push(parsed);
            
            if (parsed.type === 'agent_step') {
              stepCount++;
            }
          } catch (e) {
            // Ignore parsing errors for now
          }
        }
      }
    }

    const endTime = Date.now();
    
    // Extract cost information
    const costInfo = allData.find(item => item.type === 'agent_cost');
    
    const result = {
      mode: mode,
      computer: computer,
      cost: costInfo ? parseFloat(costInfo.cost) : null,
      balance: costInfo ? parseFloat(costInfo.balance) : null,
      session: costInfo ? costInfo.session : null,
      steps: stepCount,
      duration: endTime - startTime,
      totalChunks: allData.length
    };
    
    console.log(`💰 Cost: $${result.cost || 'N/A'}`);
    console.log(`🔢 Steps: ${result.steps}`);
    console.log(`⏱️  Duration: ${result.duration}ms`);
    console.log(`💳 Remaining Balance: $${result.balance || 'N/A'}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ API call failed:', error);
    return null;
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Agentbase API Pricing Tests\n');
  
  const allResults = [];
  
  for (const scenario of testScenarios) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 SCENARIO: ${scenario.name}`);
    console.log(`🏷️  Category: ${scenario.category}`);
    console.log('='.repeat(80));
    
    const scenarioResults = [];
    
    for (const mode of ['fast', 'flash', 'max']) {
      console.log(`\n${'-'.repeat(50)}`);
      
      const result = await testAPI(scenario.message, mode, scenario.computer);
      
      if (result) {
        result.scenario = scenario.name;
        result.category = scenario.category;
        scenarioResults.push(result);
        allResults.push(result);
      }
      
      // Wait between calls
      console.log('⏳ Waiting 5 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Show scenario summary
    if (scenarioResults.length > 0) {
      console.log(`\n📊 ${scenario.name} Summary:`);
      scenarioResults.forEach(r => {
        console.log(`  ${r.mode.toUpperCase()}: $${r.cost} (${r.steps} steps, ${r.duration}ms)`);
      });
    }
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `comprehensive-pricing-results-${timestamp}.json`;
  require('fs').writeFileSync(filename, JSON.stringify(allResults, null, 2));
  console.log(`\n💾 Results saved to ${filename}`);
  
  // Generate analysis
  generateAnalysis(allResults);
}

function generateAnalysis(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE PRICING ANALYSIS');
  console.log('='.repeat(80));
  
  // Group by mode
  const byMode = {};
  results.forEach(r => {
    if (!r.cost) return;
    if (!byMode[r.mode]) byMode[r.mode] = [];
    byMode[r.mode].push(r);
  });
  
  console.log('\n🎯 COST ANALYSIS BY MODE:');
  Object.entries(byMode).forEach(([mode, data]) => {
    const costs = data.map(d => d.cost);
    const steps = data.map(d => d.steps);
    
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    
    const avgSteps = steps.reduce((a, b) => a + b, 0) / steps.length;
    
    console.log(`\n${mode.toUpperCase()}:`);
    console.log(`  Cost Range: $${minCost.toFixed(4)} - $${maxCost.toFixed(4)}`);
    console.log(`  Average Cost: $${avgCost.toFixed(4)}`);
    console.log(`  Average Steps: ${avgSteps.toFixed(1)}`);
    console.log(`  Sample Size: ${data.length} tests`);
  });
  
  // Group by category
  const byCategory = {};
  results.forEach(r => {
    if (!r.cost) return;
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r);
  });
  
  console.log('\n🏷️  COST ANALYSIS BY TASK CATEGORY:');
  Object.entries(byCategory).forEach(([category, data]) => {
    const costs = data.map(d => d.cost);
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    
    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  Cost Range: $${minCost.toFixed(4)} - $${maxCost.toFixed(4)}`);
    console.log(`  Average Cost: $${avgCost.toFixed(4)}`);
    console.log(`  Sample Size: ${data.length} tests`);
  });
  
  // Computer vs No Computer
  const withComputer = results.filter(r => r.computer && r.cost);
  const withoutComputer = results.filter(r => !r.computer && r.cost);
  
  if (withComputer.length > 0 && withoutComputer.length > 0) {
    console.log('\n💻 COMPUTER ENVIRONMENT IMPACT:');
    
    const avgWithComputer = withComputer.reduce((sum, r) => sum + r.cost, 0) / withComputer.length;
    const avgWithoutComputer = withoutComputer.reduce((sum, r) => sum + r.cost, 0) / withoutComputer.length;
    
    console.log(`  With Computer: $${avgWithComputer.toFixed(4)} average`);
    console.log(`  Without Computer: $${avgWithoutComputer.toFixed(4)} average`);
    console.log(`  Difference: ${((avgWithComputer / avgWithoutComputer - 1) * 100).toFixed(1)}% higher with computer`);
  }
}

if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}