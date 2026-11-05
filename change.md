## Fix PetSathi Logo – Paw Icon Not Visible

The paw icon beside the PetSathi brand name is still not displaying. Fix this issue in both the header and footer.

1. Use a properly working **Font Awesome solid paw icon (`fa-solid fa-paw`)** or an inline SVG paw icon.
2. Do not use Unicode characters, emoji, placeholder squares, or unsupported icon classes.
3. If Font Awesome is not loaded, correctly include its CDN stylesheet in the shared layout.
4. If the icon library continues to fail, use an inline SVG so the icon renders without depending on an external library.
5. Set the icon color to pure white (`#FFFFFF`).
6. Set an appropriate size of approximately 24px.
7. Align the icon vertically with the PetSathi brand text.
8. Keep consistent spacing between the icon and brand name.
9. Apply the same logo in the header and footer across every page.

**Important:** Test the actual website after making the change. The paw icon must be visibly rendered, not a square, blank space, or broken character. Do not change the navigation or other footer icons.