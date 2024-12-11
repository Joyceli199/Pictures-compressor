document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const compressionRatio = document.getElementById('compressionRatio');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const previewContainer = document.querySelector('.preview-container');
    const actionButtons = document.querySelector('.action-buttons');

    let currentFile = null;
    let compressedBlob = null;

    // 点击上传区域触发文件选择
    dropZone.addEventListener('click', function(e) {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });

    // 阻止默认拖放行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 处理拖放视觉效果
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('drag-over');
    }

    function unhighlight(e) {
        dropZone.classList.remove('drag-over');
    }

    // 处理拖放
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    // 处理文件选择
    fileInput.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });

    // 处理质量滑块变化
    qualitySlider.addEventListener('input', function(e) {
        qualityValue.textContent = e.target.value;
        if (currentFile) {
            compressImage(currentFile, parseInt(e.target.value) / 100);
        }
    });

    // 重置按钮
    resetBtn.addEventListener('click', function() {
        resetUI();
    });

    // 下载按钮
    downloadBtn.addEventListener('click', function() {
        if (compressedBlob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(compressedBlob);
            link.download = 'compressed_' + currentFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

    async function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }

        currentFile = file;
        
        // 显示原始图片预览
        const reader = new FileReader();
        reader.onload = function(e) {
            originalPreview.src = e.target.result;
            originalSize.textContent = formatFileSize(file.size);
        };
        reader.readAsDataURL(file);

        // 压缩图片
        await compressImage(file, parseInt(qualitySlider.value) / 100);

        // 显示预览区域和按钮
        previewContainer.style.display = 'grid';
        actionButtons.style.display = 'flex';
    }

    async function compressImage(file, quality) {
        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: quality
            };

            compressedBlob = await imageCompression(file, options);
            
            // 更新压缩后的预览
            compressedPreview.src = URL.createObjectURL(compressedBlob);
            compressedSize.textContent = formatFileSize(compressedBlob.size);
            compressionRatio.textContent = 
                Math.round((1 - compressedBlob.size / file.size) * 100) + '%';
            
        } catch (error) {
            console.error('Error:', error);
            alert('压缩过程中出现错误：' + error.message);
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function resetUI() {
        currentFile = null;
        compressedBlob = null;
        fileInput.value = '';
        originalPreview.src = '';
        compressedPreview.src = '';
        originalSize.textContent = '0 KB';
        compressedSize.textContent = '0 KB';
        compressionRatio.textContent = '0%';
        qualitySlider.value = 85;
        qualityValue.textContent = '85';
        previewContainer.style.display = 'none';
        actionButtons.style.display = 'none';
    }
}); 