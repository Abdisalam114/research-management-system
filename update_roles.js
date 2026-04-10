const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // replace authorize('admin') to authorize('director')
            content = content.replace(/authorize\([^)]*\)/g, match => {
                let m = match;
                m = m.replace(/'admin'/g, "'director'");
                m = m.replace(/,\s*'student'/g, "");
                m = m.replace(/'student',\s*/g, "");
                m = m.replace(/'student'/g, "");
                return m;
            });
            
            // replace role === 'admin'
            content = content.replace(/role === 'admin'/g, "role === 'director'");
            content = content.replace(/role !== 'admin'/g, "role !== 'director'");
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

replaceInDir(path.join(__dirname, 'backend', 'src', 'routes'));
replaceInDir(path.join(__dirname, 'backend', 'src', 'controllers'));
console.log('Done replacing roles in backend.');
