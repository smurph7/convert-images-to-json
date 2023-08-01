const exiftool = require('exiftool-vendored').exiftool;
const fs = require('fs');

exiftool
  .version()
  .then(version => console.log(`We're running ExifTool v${version}`));

// Recursive function to get files
function getFiles(dir, files = []) {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir);
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files);
    } else {
      // If it is a file, push the full path to the files array
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('/mnt/FamilyPhoto/Collection');

files.map(file => {
  exiftool
    .read(file)

    .then(tags => {
      if (tags.FileTypeExtension === 'tif') {
        const photo = {
          _id: tags.FileName.replace('.tif', ''), // replace mov as well
          directory: tags.Directory, // ? (remove before collection)
          creator: tags.Creator,
          fileName: tags.FileName,
          downloadPath: '', // TODO
          largeViewPath: '',
          smallViewPath: '',
          keywords: tags.Keywords,
          hierarchicalKeywords: tags.HierarchicalSubject,
          fileTypeExtension: tags.FileTypeExtension
        };

        fs.readFile('data.json', function (err, data) {
          var json = JSON.parse(data);
          json.push(photo);

          fs.writeFile('data.json', JSON.stringify(json), error => {
            if (error) {
              console.error(error);
              throw error;
            }
          });
        });
        console.log('data.json written correctly');
      }
    })
    .catch(err => console.error('Something terrible happened: ', err));
});
