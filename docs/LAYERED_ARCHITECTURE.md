# Layered Architecture Diagram Format

The Living Wiki module now supports layered architecture diagrams similar to enterprise architecture diagrams.

## JSON Format

```json
{
  "layers": [
    {
      "id": "unique-layer-id",
      "title": "Layer Display Name",
      "color": "bg-cyan-50",  // Optional: Tailwind background color class
      "components": [
        {
          "id": "unique-component-id",
          "label": "Component Name",
          "sublabel": "Optional Subtitle",  // Optional
          "type": "users|device|service|database|resource|middleware",
          "icon": "optional-icon-name"  // Optional
        }
      ]
    }
  ],
  "connections": [
    {
      "from": "source-component-id",
      "to": "target-component-id",
      "style": "solid|dashed"  // Optional, defaults to solid
    }
  ]
}
```

## Component Types

- **users**: User groups (teams, external partners, etc.)
- **device**: Devices (desktop, mobile, tablets)
- **service**: Applications and platforms
- **database**: Databases and data stores
- **resource**: Backend resources (ERP, CRM, etc.)
- **middleware**: Integration services, message queues, APIs

## Layer IDs (with default colors)

- `channels` - Gray background
- `user-experience` - Cyan background
- `middleware` - Amber background
- `backend` - Purple background

You can also use custom colors by providing a `color` property with any Tailwind CSS background class.

## Example

See `/public/sample-layered-architecture.json` for a complete example matching the provided architecture diagram.

## Usage

1. Create a JSON file with the layered architecture format
2. Place it in your repository's documentation
3. The Living Wiki will automatically detect the `layers` property and render it as a layered diagram
4. If the JSON has `nodes` and `links` instead, it will render as a force-directed graph

## Features

- ✅ Automatic layout with proper spacing
- ✅ SVG arrow connections between components
- ✅ Solid and dashed line styles
- ✅ Color-coded layers
- ✅ Icon support for different component types
- ✅ Responsive design
- ✅ Hover effects on components
