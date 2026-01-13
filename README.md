# ❄️ Frosthaven Loot Deck

A lightweight, table-side web app for Frosthaven that replaces the physical loot deck.

## Features

- **Scenario Setup**: Configure your loot pool with different card types (Gold, Resources, Herbs, Random Items)
- **Random Drawing**: Spend loot tokens to draw random cards without replacement
- **Live Pool Tracking**: See remaining card counts for each type in real-time
- **Loot History**: Track all drawn loot with timestamps
- **Touch-Friendly**: Designed for shared device use at the table
- **No Dependencies**: Single HTML file - no installation required

## How to Use

1. **Open** `index.html` in any modern web browser
2. **Configure** the loot pool by setting the number of each card type
3. **Start Scenario** to initialize the shuffled loot deck
4. **Spend Token & Draw Loot** each time a player loots
5. View the drawn card, remaining pool counts, and complete loot history
6. **Reset Scenario** when starting a new scenario

## Default Loot Pool

The app comes pre-configured with a standard loot pool:
- Gold: 12×(1), 6×(2), 2×(3)
- Resources: 6× Lumber, 6× Metal, 6× Hide
- Herbs: 1× each (Axenut, Arrowvine, Flamefruit, Rockroot, Snowthistle, Corpsecap)
- 1× Random Item

Adjust these values to match your scenario requirements.

## Technical Details

- Single-page application (no server required)
- All game state managed client-side
- Cards are shuffled using Fisher-Yates algorithm
- Drawing is truly random and always without replacement
- Responsive design for phones, tablets, and desktops

## License

MIT
