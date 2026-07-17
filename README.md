# 🎨 AI Image Generator

A beautiful, modern web application for generating images using AI. Built with vanilla JavaScript, HTML, and CSS - no frameworks required!

## Features

- 🖼️ Generate images from text descriptions using OpenAI's DALL-E 3 API
- 📐 Multiple image sizes (Square, Landscape, Portrait)
- ⚙️ Adjustable quality settings (Standard, HD)
- 🎨 Style options (Vivid, Natural)
- 💾 Download generated images to your local file system
- 🔐 Secure API key storage in browser localStorage
- 📱 Responsive design for mobile and desktop
- ✨ Beautiful gradient UI with smooth animations

## Setup Instructions

### 1. Get an OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (you'll need it in the app)

### 2. Run the Application

**Option A: Using a local server (Recommended)**

```bash
# Navigate to the project directory
cd image-generator-app

# Using Python 3
python3 -m http.server 8000

# OR using Python 2
python -m SimpleHTTPServer 8000

# OR using Node.js http-server
npx http-server -p 8000
```

Then open your browser to: `http://localhost:8000`

**Option B: Direct file access**

Simply open `index.html` in your web browser. However, note that some browsers may restrict certain features when running from `file://` protocol.

### 3. Configure API Key

1. Open the application in your browser
2. Enter your OpenAI API key in the configuration section
3. Click "Save Key"
4. The key is stored locally in your browser (never sent anywhere except OpenAI)

## Usage

1. **Enter a Prompt**: Describe the image you want to generate
   - Example: "A serene mountain landscape at sunset with a lake reflection"
   - Example: "A futuristic city with flying cars and neon lights"

2. **Choose Settings**:
   - **Size**: Square (1024x1024), Landscape (1792x1024), or Portrait (1024x1792)
   - **Quality**: Standard or HD
   - **Style**: Vivid (hyper-realistic) or Natural (more natural look)

3. **Generate**: Click the "Generate Image" button

4. **Download**: Once generated, click "📥 Download Image" to save it locally

5. **Create Another**: Click "✨ Generate New Image" to start fresh

## Technologies Used

- **HTML5**: Structure and semantics
- **CSS3**: Styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Application logic and API integration
- **OpenAI DALL-E 3 API**: AI image generation

## API Information

This app uses the OpenAI DALL-E 3 API:
- Model: `dall-e-3`
- Pricing: ~$0.04-$0.08 per image (depending on quality)
- Rate Limits: Varies by account tier

Your API key is stored in your browser's localStorage and is only sent to OpenAI's servers for image generation requests.

## File Structure

```
image-generator-app/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── app.js          # Application logic and API integration
└── README.md       # This file
```

## Security Notes

- API keys are stored in browser localStorage (client-side only)
- No backend server required
- All API calls go directly from browser to OpenAI
- Never share your API key publicly

## Troubleshooting

**"Please configure your API key first"**
- Make sure you've entered and saved your OpenAI API key

**"Failed to generate image"**
- Check your API key is valid
- Ensure you have credits in your OpenAI account
- Check your internet connection

**Download not working**
- Try right-clicking the image and selecting "Save Image As..."
- Some browsers may block automatic downloads

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Future Enhancements

- [ ] Multiple image generation (batch processing)
- [ ] Image editing and variations
- [ ] Gallery to view previous generations
- [ ] Export to different formats (JPG, PNG, WebP)
- [ ] Image-to-image generation
- [ ] Custom model selection
- [ ] History tracking

## License

MIT License - feel free to use and modify!

## Support

For issues with:
- **The App**: Check the browser console for errors
- **OpenAI API**: Visit [OpenAI Help Center](https://help.openai.com/)
- **Billing**: Check your OpenAI account dashboard

---

Built with ❤️ using OpenAI DALL-E 3
