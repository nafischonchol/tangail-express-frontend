const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:\\Mohimaa\\mohimaa-warehouse-frontend');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('Mohimaa Warehouse')) {
    content = content.replace(/Mohimaa Warehouse/g, 'Mohimaa');
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});

console.log(`Replaced in ${count} files.`);
