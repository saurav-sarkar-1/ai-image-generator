class ImageGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('api_key') || '';
        this.service = localStorage.getItem('api_service') || 'pollinations';
        this.promptHistory = [];
        this.currentIteration = 0;
        this.uploadedImageData = null; // base64 data URL of uploaded image
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.checkApiKey();
    }

    cacheElements() {
        this.promptInput = document.getElementById('prompt');
        this.sizeSelect = document.getElementById('size');
        this.generateBtn = document.getElementById('generateBtn');
        this.enhancePromptBtn = document.getElementById('enhancePromptBtn');
        this.generatorSection = document.getElementById('generatorSection');
        this.resultSection = document.getElementById('resultSection');
        this.generatedImage = document.getElementById('generatedImage');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newImageBtn = document.getElementById('newImageBtn');
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.apiKeyInput = document.getElementById('apiKey');
        this.saveApiKeyBtn = document.getElementById('saveApiKey');
        this.apiSetup = document.getElementById('apiSetup');
        this.btnText = document.querySelector('.btn-text');
        this.spinner = document.querySelector('.spinner');
        this.serviceRadios = document.querySelectorAll('input[name="service"]');
        this.feedbackGoodBtn = document.getElementById('feedbackGood');
        this.feedbackBadBtn = document.getElementById('feedbackBad');
        this.improvementSection = document.getElementById('improvementSection');
        this.improvementsInput = document.getElementById('improvements');
        this.improveBtn = document.getElementById('improveBtn');
        this.promptHistorySection = document.getElementById('promptHistory');
        this.historyList = document.getElementById('historyList');
        this.issueCheckboxes = document.querySelectorAll('.issue-checklist input[type="checkbox"]');
        this.imageUploadArea = document.getElementById('imageUploadArea');
        this.imageUpload = document.getElementById('imageUpload');
        this.uploadZone = document.getElementById('uploadZone');
        this.uploadPreview = document.getElementById('uploadPreview');
        this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
        this.clearUploadBtn = document.getElementById('clearUpload');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateImage());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.newImageBtn.addEventListener('click', () => this.resetForm());
        this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.enhancePromptBtn.addEventListener('click', () => this.enhancePromptPreGeneration());
        this.feedbackGoodBtn.addEventListener('click', () => this.handleFeedback('good'));
        this.feedbackBadBtn.addEventListener('click', () => this.handleFeedback('bad'));
        this.improveBtn.addEventListener('click', () => this.improveImage());

        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.generateImage();
            }
        });

        // Set the saved service
        this.serviceRadios.forEach(radio => {
            if (radio.value === this.service) radio.checked = true;
            radio.addEventListener('change', () => this.onServiceChange());
        });

        // Image upload
        this.imageUpload.addEventListener('change', (e) => this.handleImageFile(e.target.files[0]));
        this.clearUploadBtn.addEventListener('click', (e) => { e.preventDefault(); this.clearUpload(); });

        // Drag and drop
        this.uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); this.uploadZone.classList.add('drag-over'); });
        this.uploadZone.addEventListener('dragleave', () => this.uploadZone.classList.remove('drag-over'));
        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) this.handleImageFile(file);
        });
    }

    onServiceChange() {
        const service = document.querySelector('input[name="service"]:checked')?.value;
        // Show upload area only for huggingface (the only free img2img provider)
        if (this.imageUploadArea) {
            this.imageUploadArea.style.display = (service === 'huggingface') ? 'block' : 'none';
        }
        this.checkApiKey();
    }

    handleImageFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImageData = e.target.result; // base64 data URL
            this.uploadPreview.src = this.uploadedImageData;
            this.uploadPreview.style.display = 'block';
            this.uploadPlaceholder.style.display = 'none';
            this.clearUploadBtn.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    clearUpload() {
        this.uploadedImageData = null;
        this.imageUpload.value = '';
        this.uploadPreview.src = '';
        this.uploadPreview.style.display = 'none';
        this.uploadPlaceholder.style.display = 'block';
        this.clearUploadBtn.style.display = 'none';
    }

    checkApiKey() {
        const selectedService = document.querySelector('input[name="service"]:checked')?.value || 'pollinations';

        if (!localStorage.getItem('api_service')) {
            this.service = 'pollinations';
            localStorage.setItem('api_service', 'pollinations');
            localStorage.setItem('api_key', 'not-needed');
        }

        // Show upload area only for huggingface
        if (this.imageUploadArea) {
            this.imageUploadArea.style.display = (selectedService === 'huggingface') ? 'block' : 'none';
        }

        if (selectedService === 'pollinations') {
            this.apiSetup.style.display = 'none';
            this.generatorSection.style.display = 'block';
            this.promptInput.focus();
        } else if (selectedService === 'huggingface' && this.apiKey && this.apiKey !== 'not-needed') {
            this.apiSetup.style.display = 'none';
            this.generatorSection.style.display = 'block';
            this.promptInput.focus();
        } else if (selectedService === 'stability' && this.apiKey) {
            this.apiSetup.style.display = 'none';
            this.generatorSection.style.display = 'block';
            this.promptInput.focus();
        } else {
            this.apiSetup.style.display = 'block';
            this.generatorSection.style.display = 'none';
            this.apiKeyInput.focus();
        }
    }

    saveApiKey() {
        const selectedService = document.querySelector('input[name="service"]:checked')?.value || 'pollinations';
        const apiKey = this.apiKeyInput.value.trim();

        // Hugging Face and Pollinations free tier don't need API key
        if (selectedService === 'huggingface' || selectedService === 'pollinations') {
            if (!apiKey) {
                this.showError('Please paste your free Hugging Face token (hf_...). See the instructions above.');
                return;
            }
            this.service = selectedService;
            this.apiKey = apiKey;
            localStorage.setItem('api_service', selectedService);
            localStorage.setItem('api_key', apiKey);
            this.apiKeyInput.value = '';
            this.showSuccess('Hugging Face token saved! You can now generate images.');
            this.checkApiKey();
            return;
        }

        if (apiKey) {
            this.apiKey = apiKey;
            this.service = selectedService;
            localStorage.setItem('api_key', apiKey);
            localStorage.setItem('api_service', selectedService);
            this.apiKeyInput.value = '';
            this.showSuccess(`Stability AI API key saved! You can now generate images.`);
            this.checkApiKey();
        } else {
            this.showError('Please enter a valid API key or select Hugging Face/Pollinations');
        }
    }

    async generateImage(isImprovement = false) {
        const prompt = this.promptInput.value.trim();

        if (!prompt) {
            this.showError('Please enter a prompt to generate an image');
            return;
        }

        // Check for real person names and warn user
        const realPersonNames = [
            'sourav ganguly', 'virat kohli', 'sachin tendulkar', 'dhoni', 'rohit sharma',
            'elon musk', 'jeff bezos', 'bill gates', 'mark zuckerberg',
            'trump', 'biden', 'obama', 'modi', 'shah rukh khan', 'salman khan',
            'amitabh bachchan', 'ronaldo', 'messi', 'lebron james', 'tom cruise'
        ];

        const promptLower = prompt.toLowerCase();
        const containsRealPerson = realPersonNames.some(name => promptLower.includes(name));

        if (containsRealPerson) {
            this.showError('⚠️ AI cannot generate accurate images of real people (celebrities, politicians, athletes). The result will be a generic interpretation, not the actual person. Try describing characteristics instead: "Indian cricket captain in blue jersey, batting pose"');
            // Still allow generation to proceed after warning
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const selectedService = this.service || 'pollinations';

        // Warn if image uploaded but service doesn't support it
        if (this.uploadedImageData && selectedService !== 'huggingface') {
            this.showError('Image upload is only supported with Hugging Face. Switch to Hugging Face or remove the image.');
            return;
        }

        this.setLoading(true);
        this.hideError();

        // Hide improvement section when generating new image
        if (!isImprovement) {
            this.improvementSection.style.display = 'none';
            this.currentIteration = 0;
            this.promptHistory = [];
        }

        try {
            let imageUrl;

            if (selectedService === 'huggingface') {
                if (this.uploadedImageData) {
                    imageUrl = await this.generateWithHuggingFaceImg2Img(prompt, this.uploadedImageData);
                } else {
                    imageUrl = await this.generateWithHuggingFace(prompt);
                }
            } else if (selectedService === 'pollinations') {
                imageUrl = await this.generateWithPollinations(prompt);
            } else if (selectedService === 'stability') {
                imageUrl = await this.generateWithStability(prompt);
            } else if (selectedService === 'openai') {
                imageUrl = await this.generateWithOpenAI(prompt);
            }

            // Track prompt history
            this.currentIteration++;
            this.promptHistory.push({
                iteration: this.currentIteration,
                prompt: prompt,
                timestamp: new Date().toLocaleString()
            });

            await this.displayImage(imageUrl);
            this.updatePromptHistory();

        } catch (error) {
            this.showError(`Error: ${error.message}`);
            console.error('Generation error:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async generateWithHuggingFace(prompt) {
        const API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

        if (!this.apiKey || this.apiKey === 'not-needed') {
            throw new Error('A Hugging Face token is required. Go to Settings and add your free token.');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_inference_steps: 50,
                    guidance_scale: 7.5
                }
            })
        });

        if (!response.ok) {
            if (response.status === 503) {
                throw new Error('Model is loading, please wait 20 seconds and try again');
            }
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid Hugging Face token. Please check your token in Settings.');
            }
            const errorText = await response.text();
            throw new Error(`Hugging Face API error: ${errorText}`);
        }

        // Response is a blob (image)
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        return imageUrl;
    }

    async generateWithHuggingFaceImg2Img(prompt, imageDataUrl) {
        // Convert base64 data URL to a Blob
        const base64 = imageDataUrl.split(',')[1];
        const mimeMatch = imageDataUrl.match(/data:([^;]+);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const byteChars = atob(base64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        const imageBlob = new Blob([byteArr], { type: mime });

        // Use the img2img endpoint on HF Inference API
        // stabilityai/stable-diffusion-2-1 supports image input via multipart
        const API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-refiner-1.0';

        const formData = new FormData();
        formData.append('inputs', prompt);
        formData.append('image', imageBlob, 'input.png');
        formData.append('parameters', JSON.stringify({ strength: 0.75, num_inference_steps: 30 }));

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.apiKey}` },
            body: formData
        });

        if (!response.ok) {
            if (response.status === 503) throw new Error('Model is loading, please wait 20 seconds and try again.');
            if (response.status === 401 || response.status === 403) throw new Error('Invalid Hugging Face token. Please check your token in Settings.');
            const errorText = await response.text();
            // Fallback: if img2img fails, try text2img with the prompt
            if (response.status === 422 || response.status === 400) {
                this.showSuccess('Note: img2img not supported by this model, generating from prompt only.');
                return await this.generateWithHuggingFace(prompt);
            }
            throw new Error(`Hugging Face error: ${errorText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    handleFeedback(type) {
        if (type === 'good') {
            this.showSuccess('Great! Glad you like the result. You can download it now.');
            this.improvementSection.style.display = 'none';
        } else {
            this.improvementSection.style.display = 'block';
            this.improvementSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    improveImage() {
        const originalPrompt = this.promptInput.value.trim();
        const improvementNotes = this.improvementsInput.value.trim();

        // Get checked issues
        const selectedIssues = Array.from(this.issueCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value.replace(/_/g, ' '));

        if (!improvementNotes && selectedIssues.length === 0) {
            this.showError('Please describe what needs to be improved or select issues');
            return;
        }

        // Build improved prompt with better AI guidance
        let improvedPrompt = this.enhancePrompt(originalPrompt, selectedIssues, improvementNotes);

        // Update prompt input
        this.promptInput.value = improvedPrompt;

        // Track improvement in history
        if (this.promptHistory.length > 0) {
            this.promptHistory[this.promptHistory.length - 1].improvements = {
                issues: selectedIssues,
                notes: improvementNotes
            };
        }

        // Clear improvement fields
        this.improvementsInput.value = '';
        this.issueCheckboxes.forEach(cb => cb.checked = false);

        // Generate with improved prompt
        this.generateImage(true);
    }

    enhancePromptPreGeneration() {
        const currentPrompt = this.promptInput.value.trim();

        if (!currentPrompt) {
            this.showError('Please enter a prompt first');
            return;
        }

        // Enhance the prompt with professional photography/art terms
        const enhanced = this.autoEnhancePrompt(currentPrompt);
        this.promptInput.value = enhanced;
        this.showSuccess('Prompt enhanced! Review it and click Generate Image.');
    }

    autoEnhancePrompt(prompt) {
        // Check if prompt already has quality modifiers
        const hasQualityTerms = /\b(4k|8k|hd|uhd|high quality|detailed|photorealistic)\b/i.test(prompt);
        const hasLightingTerms = /\b(lighting|golden hour|cinematic|dramatic|soft light)\b/i.test(prompt);
        const hasStyleTerms = /\b(realistic|painting|artistic|professional|photography)\b/i.test(prompt);

        let enhanced = prompt;

        // Add quality terms if missing
        if (!hasQualityTerms) {
            enhanced += ', highly detailed, 8k uhd, high quality';
        }

        // Add lighting if missing
        if (!hasLightingTerms) {
            enhanced += ', perfect lighting, professional photography';
        }

        // Add style if missing
        if (!hasStyleTerms) {
            enhanced += ', photorealistic, sharp focus';
        }

        // Add composition terms
        enhanced += ', well-composed, masterpiece';

        return enhanced;
    }

    enhancePrompt(originalPrompt, issues, notes) {
        let enhanced = originalPrompt;

        // Add quality and style modifiers based on issues
        const modifiers = [];

        if (issues.includes('missing elements')) {
            modifiers.push('highly detailed');
            modifiers.push('complete composition');
        }

        if (issues.includes('wrong style')) {
            modifiers.push('professional photography');
            modifiers.push('artistic style');
        }

        if (issues.includes('wrong colors or lighting')) {
            modifiers.push('perfect lighting');
            modifiers.push('vibrant colors');
            modifiers.push('high contrast');
        }

        if (issues.includes('composition')) {
            modifiers.push('well-composed');
            modifiers.push('rule of thirds');
            modifiers.push('balanced composition');
        }

        if (issues.includes('quality')) {
            modifiers.push('8k uhd');
            modifiers.push('high quality');
            modifiers.push('sharp focus');
            modifiers.push('photorealistic');
        }

        if (issues.includes('wrong subject')) {
            modifiers.push('accurate subject');
            modifiers.push('correct proportions');
        }

        // Add user's specific improvements
        if (notes) {
            enhanced += ', ' + notes;
        }

        // Add quality modifiers at the end
        if (modifiers.length > 0) {
            enhanced += ', ' + modifiers.join(', ');
        }

        // Add negative prompt guidance (what to avoid)
        const negativeTerms = ['blurry', 'low quality', 'distorted', 'cropped', 'out of frame'];
        enhanced += ', NOT: ' + negativeTerms.join(', ');

        return enhanced;
    }

    updatePromptHistory() {
        if (this.promptHistory.length === 0) {
            this.promptHistorySection.style.display = 'none';
            return;
        }

        this.promptHistorySection.style.display = 'block';
        this.historyList.innerHTML = '';

        this.promptHistory.forEach((item) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            let html = `
                <div class="iteration">Iteration ${item.iteration} - ${item.timestamp}</div>
                <div class="prompt-text">${item.prompt}</div>
            `;

            if (item.improvements) {
                const improvementText = [
                    ...item.improvements.issues,
                    item.improvements.notes
                ].filter(Boolean).join(', ');

                html += `<div class="improvements-text">Improvements: ${improvementText}</div>`;
            }

            historyItem.innerHTML = html;
            this.historyList.appendChild(historyItem);
        });
    }

    async generateWithPollinations(prompt) {
        const celebrityPattern = /\b(sourav ganguly|virat kohli|sachin tendulkar|dhoni|rohit sharma|elon musk|trump|biden|obama|celebrity name)\b/i;
        if (celebrityPattern.test(prompt)) {
            console.warn('Note: AI image generators cannot create accurate images of real people due to privacy/copyright. The result will be a generic interpretation.');
        }

        const encodedPrompt = encodeURIComponent(prompt);
        const timestamp = Math.floor(Math.random() * 2147483647);
        const width = 1024;
        const height = 1024;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${timestamp}&model=flux`;

        // Check for rate limit or error before displaying
        const response = await fetch(imageUrl, { cache: 'no-store' });
        if (!response.ok) {
            let errorMsg = '';
            try {
                const data = await response.json();
                errorMsg = data?.error?.message || data?.message || '';
            } catch {}
            if (response.status === 402) {
                throw new Error(`Pollinations rate limit: ${errorMsg || 'Wait 45 seconds between requests.'}`);
            }
            if (response.status === 503) {
                throw new Error(`Pollinations is overloaded. ${errorMsg || 'Please try again in a few seconds.'}`);
            }
            throw new Error(errorMsg || `Pollinations error (${response.status}). Please try again later.`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    async generateWithStability(prompt) {
        const size = this.sizeSelect.value.split('x')[0];

        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: parseInt(size),
                width: parseInt(size),
                steps: 30,
                samples: 1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate image with Stability AI');
        }

        const data = await response.json();
        const base64Image = data.artifacts[0].base64;
        return `data:image/png;base64,${base64Image}`;
    }

    async generateWithOpenAI(prompt) {
        const size = this.sizeSelect.value;

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: size,
                response_format: 'url'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate image with OpenAI');
        }

        const data = await response.json();
        return data.data[0].url;
    }

    async testImageUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }

    async displayImage(imageUrl) {
        return new Promise((resolve, reject) => {
            this.generatedImage.onload = () => {
                this.resultSection.style.display = 'block';
                this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                resolve();
            };
            this.generatedImage.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            this.generatedImage.src = imageUrl;
        });
    }

    async downloadImage() {
        try {
            const imageUrl = this.generatedImage.src;

            // For data URLs, we can download directly
            if (imageUrl.startsWith('data:')) {
                const link = document.createElement('a');
                link.href = imageUrl;
                const timestamp = new Date().getTime();
                const prompt = this.promptInput.value.trim()
                    .substring(0, 30)
                    .replace(/[^a-z0-9]/gi, '_')
                    .toLowerCase();
                link.download = `ai_image_${prompt}_${timestamp}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.showSuccess('Image downloaded successfully!');
                return;
            }

            // For regular URLs, fetch and download
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const timestamp = new Date().getTime();
            const prompt = this.promptInput.value.trim()
                .substring(0, 30)
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            link.download = `ai_image_${prompt}_${timestamp}.png`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            this.showSuccess('Image downloaded successfully!');
        } catch (error) {
            this.showError('Failed to download image. Please try right-clicking and saving manually.');
            console.error('Download error:', error);
        }
    }

    resetForm() {
        this.promptInput.value = '';
        this.resultSection.style.display = 'none';
        this.improvementSection.style.display = 'none';
        this.promptHistorySection.style.display = 'none';
        this.improvementsInput.value = '';
        this.issueCheckboxes.forEach(cb => cb.checked = false);
        this.promptHistory = [];
        this.currentIteration = 0;
        this.clearUpload();
        this.hideError();
        this.promptInput.focus();
    }

    setLoading(isLoading) {
        this.generateBtn.disabled = isLoading;
        if (isLoading) {
            this.btnText.style.display = 'none';
            this.spinner.style.display = 'inline-block';
        } else {
            this.btnText.style.display = 'inline';
            this.spinner.style.display = 'none';
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.textContent = message;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => successDiv.remove(), 300);
        }, 3000);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});
