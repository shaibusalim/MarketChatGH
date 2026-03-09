const fs = require('fs');
let code = fs.readFileSync('src/components/InteractiveElements.tsx', 'utf8');

// 1. Move PersonalizedProducts to above Testimonials
code = code.replace(/\s*<PersonalizedProducts \/>\n/g, '\n');
code = code.replace('{/* Testimonials Section */}', '<PersonalizedProducts />\n\n      {/* Testimonials Section */}');

// 2. Remove About Us Section completely
const aboutRegex = /\s*\{\/\* About Us Section \*\/\}[\s\S]*?<\/section>/;
code = code.replace(aboutRegex, '');

// 3. Remove Contact Section completely
const contactRegex = /\s*\{\/\* Contact Section \*\/\}[\s\S]*?<\/section>/;
code = code.replace(contactRegex, '');

// 4. Move Blog Section to the bottom (just before </>)
const blogRegex = /\s*\{\/\* Blog Section \*\/\}[\s\S]*?<\/div>/;
const blogMatch = code.match(blogRegex);
if (blogMatch) {
    code = code.replace(blogRegex, '');
    code = code.replace(/(\s*)<\/ >/, '$1' + blogMatch[0] + '$1</>'); // fallback
    code = code.replace(/(\s*)<\/>/, '$1' + blogMatch[0] + '\n$1</>');
}

fs.writeFileSync('src/components/InteractiveElements.tsx', code);
console.log("Successfully reorganized InteractiveElements.tsx");
