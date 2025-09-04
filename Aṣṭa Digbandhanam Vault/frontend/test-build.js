// Simple test to verify frontend build
const fs = require('fs');
const path = require('path');

console.log('Testing frontend build...');

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ dist folder exists');
  
  // Check if index.html exists
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html exists');
    
    // Check if assets folder exists
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      console.log('✅ assets folder exists');
    } else {
      console.log('❌ assets folder missing');
    }
  } else {
    console.log('❌ index.html missing');
  }
} else {
  console.log('❌ dist folder missing');
}

console.log('Build test complete.');
