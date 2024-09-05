// Handle image file change to show original size
document.getElementById('image').addEventListener('change', function (event) {
    const imageInput = event.target.files[0];

    if (imageInput) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                // Display original image size
                const originalSizeDiv = document.getElementById('originalSize');
                originalSizeDiv.innerText = `Original Size: ${img.width} x ${img.height} px`;

                // Set default values for width and height inputs
                document.getElementById('width').value = img.width;
                document.getElementById('height').value = img.height;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(imageInput);
    }
});

// Handle the resize and drawing of the canvas
document.getElementById('resizeForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const imageInput = document.getElementById('image').files[0];
    const widthInput = parseInt(document.getElementById('width').value);
    const heightInput = parseInt(document.getElementById('height').value);

    if (imageInput && widthInput && heightInput) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                // Resize the image using canvas
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');

                // Ensure the canvas respects the max-width constraint
                const maxCanvasWidth = document.getElementById('result').offsetWidth;

                if (widthInput > maxCanvasWidth) {
                    const scaleFactor = maxCanvasWidth / widthInput;
                    canvas.width = maxCanvasWidth;
                    canvas.height = heightInput * scaleFactor;
                } else {
                    canvas.width = widthInput;
                    canvas.height = heightInput;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the previous canvas content
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.style.display = 'block';

                // Remove previous download link if any
                const previousLink = document.getElementById('downloadLink');
                if (previousLink) {
                    previousLink.remove();
                }

               // Create and append a download link for the resized image
                const downloadLink = document.createElement('a');
                downloadLink.href = canvas.toDataURL();
                downloadLink.download = 'resized-image.png';
                downloadLink.innerText = 'Download Resized Image';
                downloadLink.id = 'downloadLink'; // Set an ID for styling
                downloadLink.classList.add('button'); // Add the button class for styling
                document.getElementById('result').appendChild(downloadLink);

            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(imageInput);
    } else {
        alert('Please provide all the inputs.');
    }
});
