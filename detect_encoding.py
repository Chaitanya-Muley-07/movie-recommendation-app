import chardet

# Replace 'data/project.csv' with the correct path to your CSV file
file_path = 'data/project.csv'

with open(file_path, 'rb') as f:
    result = chardet.detect(f.read())
    print(result)
