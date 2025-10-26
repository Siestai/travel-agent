# Google Maps Integration Setup

This guide will help you set up Google Maps for the travel agent application.

## Step 1: Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**:

   - Go to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"

4. Create credentials:

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

5. (Optional but recommended) Restrict your API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "Maps JavaScript API"
   - Under "Application restrictions", add your domain

## Step 2: Configure Environment Variables

Add your Google Maps API key to your environment variables:

### For Local Development

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - Name: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: Your API key
   - Environment: Production, Preview, Development (select as needed)

## Step 3: Verify the Integration

1. Start your development server:

   ```bash
   pnpm dev
   ```

2. Navigate to the Maps page (click "Maps" in the sidebar)

3. You should see your travel locations displayed on an interactive map

## Features

The Google Maps integration includes:

- **Interactive Map**: Pan, zoom, and explore your travel locations
- **Location Markers**: Different markers for airports, stations, accommodations, and destinations
- **Info Windows**: Click on markers to see location details including document title and dates
- **Auto-centering**: The map automatically centers on your locations
- **Smart Zoom**: Adjusts zoom level based on the number of locations

## Troubleshooting

### Map doesn't load

- Check that your API key is correctly set in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Verify that the Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for error messages

### API key errors

- Ensure your API key restrictions allow requests from your domain
- For local development, you may need to allow `localhost` in your API key restrictions

### No locations showing

- Upload travel documents first - the map displays locations from your documents
- Check that your documents have valid coordinates

## Security Best Practices

1. **Never commit your API key** to version control
2. **Use API key restrictions** in Google Cloud Console to limit usage
3. **Monitor usage** in Google Cloud Console to detect unexpected activity
4. **Rotate keys** if you suspect a security breach

## Pricing

Google Maps API usage is billed based on:

- Map loads (per 1,000 loads)
- Dynamic map styling

Check the [Google Maps Pricing](https://cloud.google.com/maps-platform/pricing) page for current rates.

**Note**: Google provides $200 in free credits per month, which covers most use cases for development and moderate traffic.

## Next Steps

Once you have the basic map working, you can:

1. Customize marker icons for different location types
2. Add route visualization between connected locations
3. Implement location clustering for better performance
4. Add custom map styling to match your brand
