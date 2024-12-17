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

    // Input validation
    if (!imageInput) {
        alert('Please select an image file.');
        return;
    }
    if (isNaN(widthInput) || widthInput <= 0 || isNaN(heightInput) || heightInput <= 0) {
        alert('Please enter valid width and height values greater than 0.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            // Resize the image using canvas
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to match user-specified dimensions
            canvas.width = widthInput;
            canvas.height = heightInput;

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the previous canvas content
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Ensure canvas is visible
            canvas.style.display = 'block';

            // Remove previous download link if any
            const previousLink = document.getElementById('downloadLink');
            if (previousLink) {
                previousLink.remove();
            }

            // Create and append a download link for the resized image
            const downloadLink = document.createElement('a');
            downloadLink.href = canvas.toDataURL('image/png'); // Convert canvas to image data
            downloadLink.download = 'resized-image.png';
            downloadLink.innerText = 'Download Resized Image';
            downloadLink.id = 'downloadLink';
            downloadLink.classList.add('button'); // Optional: style link as a button
            document.getElementById('result').appendChild(downloadLink);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(imageInput);
});
