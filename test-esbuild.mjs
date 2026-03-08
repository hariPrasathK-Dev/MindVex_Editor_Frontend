import fs from 'fs';
const lines = fs.readFileSync('app/components/workbench/tools/RealTimeGraphPage.tsx', 'utf8').split('\n');
console.log(lines[102]);
console.log(lines[102][22]);
