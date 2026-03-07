import re

def check_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simple brace counter
    braces = 0
    brackets = 0
    tags = []
    
    # Simple tag parser for JSX
    # This is a bit naive but should help find unmatched tags
    tag_pattern = re.compile(r'<(/?)([a-zA-Z0-9.\-_]+)([^>]*?)(/?)>')
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        line_num = i + 1
        
        # Count braces
        for char in line:
            if char == '{': braces += 1
            if char == '}': braces -= 1
            if char == '[': brackets += 1
            if char == ']': brackets -= 1
        
        # Find tags
        for match in tag_pattern.finditer(line):
            is_closing = match.group(1) == '/'
            tag_name = match.group(2)
            is_self_closing = match.group(4) == '/'
            
            if is_self_closing:
                continue
            if is_closing:
                if not tags:
                    print(f"Error: Unexpected closing tag </{tag_name}> at line {line_num}")
                else:
                    last_tag = tags.pop()
                    if last_tag != tag_name:
                        print(f"Error: Mismatched tag </{tag_name}>, expected </{last_tag}> at line {line_num}")
            else:
                tags.append(tag_name)

    print(f"Final Balance - Braces: {braces}, Brackets: {brackets}, Open Tags: {tags}")

if __name__ == "__main__":
    check_balance(r'c:\Users\Prakhar1\Desktop\Website_UI\src\App.jsx')
