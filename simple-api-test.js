#!/usr/bin/env node

const API_KEY = 'sk-agb-0ea8da6c72ae31a6294d790c711260bb096a9ddf3af299c7b3017b7b51a3e98a';
const API_URL = 'https://api.agentbase.sh';

async function testSingleCall(mode = 'fast') {
  console.log(`🔄 Testing single API call with mode: ${mode}`);
  
  const payload = {
    message: "Hello! What's 2+2?",
    mode: mode
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`📡 Response status: ${response.status}`);
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let allData = [];
    let rawText = '';

    console.log('\n📨 Streaming response:');
    console.log('─'.repeat(50));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      rawText += chunk;
      
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.trim() === '' || line.startsWith(':')) continue;
        
        if (line.startsWith('data: ')) {
          const data = line.substring(6).trim();
          if (data === '[DONE]') {
            console.log('✅ Stream completed');
            continue;
          }
          
          try {
            const parsed = JSON.parse(data);
            allData.push(parsed);
            
            // Print key information from each chunk
            if (parsed.type === 'agent_cost') {
              console.log(`💰 COST INFO: $${parsed.cost}, Balance: $${parsed.balance}`);
            } else if (parsed.type === 'agent_message') {
              console.log(`💬 MESSAGE: ${parsed.message?.substring(0, 100)}...`);
            } else {
              console.log(`📦 DATA: ${parsed.type || 'unknown'}`);
            }
          } catch (e) {
            console.log(`⚠️  Could not parse: ${data.substring(0, 100)}...`);
          }
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`Total chunks received: ${allData.length}`);
    
    // Find cost information
    const costInfo = allData.find(item => item.type === 'agent_cost');
    if (costInfo) {
      console.log(`💰 Final cost: $${costInfo.cost}`);
      console.log(`💳 Remaining balance: $${costInfo.balance}`);
      console.log(`🆔 Session: ${costInfo.session}`);
    }

    // Save raw response for debugging
    require('fs').writeFileSync(`raw-response-${mode}-${Date.now()}.txt`, rawText);
    console.log(`💾 Raw response saved to file for debugging`);
    
    return allData;

  } catch (error) {
    console.error('❌ API call failed:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 Testing Agentbase API Connection\n');
  
  // Test each mode with a simple question
  for (const mode of ['fast', 'flash', 'max']) {
    console.log(`\n${'='.repeat(60)}`);
    const result = await testSingleCall(mode);
    
    if (result) {
      console.log(`✅ ${mode.toUpperCase()} mode test completed successfully`);
    } else {
      console.log(`❌ ${mode.toUpperCase()} mode test failed`);
    }
    
    // Wait between tests
    console.log('⏱️  Waiting 3 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

if (require.main === module) {
  main().catch(console.error);
}