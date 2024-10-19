const imagePaths = [
  'memes/001.jpg',
  'memes/002.jpg',
  'memes/003.jpg',
  'memes/004.jpg',
  'memes/005.jpg',
  'memes/006.jpg',
  'memes/007.jpg'
]

function pickRandomImagePath() {
  return imagePaths[Math.floor(imagePaths.length * Math.random())];
}

export function displayMeme(finishedCallback) {
  const container = document.createElement('div');
  container.className = 'fixed inset-0 flex justify-center items-center bg-black/75'

  const img = document.createElement('img');
  img.className = 'animate-show-meme'
  img.src = pickRandomImagePath();
  container.append(img);

  document.body.append(container);

  setTimeout(() => {
    container.remove();
    finishedCallback();
  }, 5000);
}
