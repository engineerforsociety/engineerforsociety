const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Backspace\\engineerforsociety\\engineerforsociety\\src\\app\\page.tsx';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // We want to keep lines 1-5 (indices 0-4)
    // And remove lines 6-58 (indices 5-57)
    // And keep lines 59+ (indices 58+)

    // Verify context before deleting
    // Line 5 (index 4) should contain "MessageSquare,"
    // Line 59 (index 58) should contain "Heart,"

    // Checking somewhat loosely to avoid off-by-one breakages
    console.log('Line 5 content:', lines[4]);
    console.log('Line 59 content:', lines[58]);

    const newLines = [
        ...lines.slice(0, 5),
        ...lines.slice(58)
    ];

    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log('Successfully cleaned up page.tsx imports!');

} catch (error) {
    console.error('Error fixing file:', error);
}
