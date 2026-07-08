import { GenerationParams, StyleOption, Point, ColorPalette, Lighting, DepthOfField, ModelOption } from "../types";

// Helper to clean base64 string for API usage
const extractBase64Data = (dataUrl: string): string => {
  return dataUrl.split(',')[1] || "";
};

const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.*);base64,/);
  return match ? match[1] : 'image/png';
}

export const COLOR_PALETTE_PROMPTS: Record<string, string> = {
  [ColorPalette.VIBRANT]: "vibrant colors, high saturation, intense vivid tones, colorful",
  [ColorPalette.PASTEL]: "pastel color palette, soft washed-out colors, desaturated, gentle tones, soothing",
  [ColorPalette.MONOCHROME]: "black and white, monochromatic, grayscale, high contrast, noir aesthetic",
  [ColorPalette.SEPIA]: "sepia tone, vintage photo effect, warm brown overlay, nostalgic, old paper texture",
  [ColorPalette.CYBER_NEON]: "neon color palette, cyan, magenta, electric purple, glowing lights, dark background",
  [ColorPalette.EARTH_TONES]: "earthy color palette, forest greens, browns, beige, natural organic tones, muted",
  [ColorPalette.COOL_BLUES]: "cool color palette, shades of blue, teal, icy tones, calm, winter atmosphere",
  [ColorPalette.WARM_SUNSET]: "warm color palette, golden hour colors, orange, red, yellow, inviting, sunset glow",
  [ColorPalette.NONE]: ""
};

export const LIGHTING_PROMPTS: Record<string, string> = {
  [Lighting.GOLDEN_HOUR]: "golden hour lighting, warm sunlight, long shadows, soft sun flare, magical atmosphere",
  [Lighting.CINEMATIC]: "cinematic lighting, dramatic atmosphere, professional color grading, rim lights, volumetric lighting",
  [Lighting.DRAMATIC]: "high contrast lighting, chiaroscuro, deep shadows, intense highlights, dramatic mood",
  [Lighting.NATURAL]: "soft natural lighting, diffused daylight, even exposure, realistic environmental light",
  [Lighting.NEON]: "neon rim lighting, colored gel lights, cybernetic glow, dark background with bright accents",
  [Lighting.BIOLUMINESCENT]: "bioluminescent glow, ethereally lit, glowing organic elements, magical night scene",
  [Lighting.FOGGY]: "foggy atmosphere, diffused light, mist, depth haze, mysterious mood, soft scattering",
  [Lighting.STUDIO]: "professional studio lighting, 3-point lighting setup, softbox, perfect even illumination, neutral background influence",
  [Lighting.NONE]: ""
};

export const DEPTH_PROMPTS: Record<string, string> = {
  [DepthOfField.SHALLOW]: "shallow depth of field, strong bokeh, blurred background, sharp focus on subject, macro photography feel, f/1.8 aperture",
  [DepthOfField.DEEP]: "deep depth of field, everything in focus, sharp background, f/16 aperture, hyper-clear landscape",
  [DepthOfField.NONE]: ""
};

export const STYLE_PROMPTS: Record<string, string> = {
  [StyleOption.CYBERPUNK]: "cyberpunk aesthetic, neon-drenched night city, high-tech low-life, cybernetics, chromatic aberration, rain-slicked streets, futuristic dystopia, bioluminescent accents, synthwave palette",
  [StyleOption.WATERCOLOR]: "traditional watercolor painting, wet-on-wet technique, soft bleeding edges, translucent layers, textured paper grain, artistic splatters, dreamy pastel colors, fluid strokes",
  [StyleOption.REALISTIC]: "photorealistic 8k, unreal engine 5 render, cinematic lighting, ray tracing, incredibly detailed, sharp focus, macro photography texture, depth of field, raw photo realism",
  [StyleOption.SKETCH]: "rough charcoal sketch, graphite pencil lines, cross-hatching shading, monochromatic greyscale, hand-drawn on textured paper, artistic draftsmanship, expressive linework",
  [StyleOption.RETRO]: "80s retro synthwave, neon grid landscape, VHS tracking error, lo-fi aesthetic, chrome typography, vibrant magenta and cyan, CRT monitor scanlines, retro-futurism",
  [StyleOption.SURREAL]: "surrealist masterpiece, salvador dali style, melting clocks and objects, impossible geometry, dreamlike atmosphere, subconscious imagery, eerie fog, bizarre juxtapositions",
  [StyleOption.PIXEL]: "pixel art, 16-bit retro game sprite, limited color palette, dithering patterns, blocky aesthetic, sharp pixel edges, chiptune vibe, nostalgic arcade style",
  [StyleOption.PIXEL_GAME_ASSET]: "professional 2d game asset, pixel art sprite, transparent background friendly, clean outlines, flat perspective or side view, unified 32-bit color palette, crisp edges, suitable for unity/godot, no anti-aliasing blur",
  [StyleOption.VECTOR_ART]: "professional flat vector illustration, clean svg style, solid single-color background, minimalist design, sharp distinct lines, adobe illustrator aesthetic, geometric composition, no photorealism, vibrant solid colors, high quality icon style",
  [StyleOption.VECTOR_LAYERS]: "Professional vector illustration with distinct, easily separable layers. Each element is a whole shape with solid colors and bold, clean outlines. Flat design aesthetic, no gradients or complex textures. The style should be suitable for creating die-cut stickers or layered papercraft, where each color can be isolated easily. Minimalist, graphic design, crisp edges.",
  [StyleOption.IMPRESSIONIST]: "impressionist oil painting, claude monet style, visible dabbing brushstrokes, vibrant natural light, capturing fleeting moments, atmospheric perspective, rich texture",
  [StyleOption.NOIR]: "classic film noir, high contrast black and white, chiaroscuro lighting, dramatic shadows, silhouette, detective mystery atmosphere, cinematic film grain, moody rain",
  [StyleOption.ANIME]: "high-quality anime art, studio ghibli style, cel-shaded characters, vibrant detailed backgrounds, emotive expressions, dynamic camera angles, 2D animation aesthetic",
  [StyleOption.OIL_PAINTING]: "classical oil painting on canvas, thick impasto texture, rich pigments, traditional masterpiece techniques, dramatic lighting, visible brushwork, varnish finish",
  [StyleOption.CLAY]: "claymation stop-motion, plasticine texture, thumbprint details, aardman style, miniature set design, soft lighting, handcrafted diorama look, depth of field",
  [StyleOption.HOLOGRAPHIC]: "futuristic 3D hologram, translucent light projection, volumetric glow, cyan and magenta data streams, sci-fi interface, floating particles, cybernetic visualization",
  [StyleOption.RUBBER_HOSE]: "1930s rubber hose animation, vintage black and white cartoon, pie-cut eyes, rhythmic bounce, film grain and scratches, steamboat willie aesthetic, whimsical and surreal",
  [StyleOption.STEAMPUNK]: "steampunk aesthetic, brass gears and cogs, steam-powered machinery, victorian sci-fi, copper piping, leather straps, ornate clockwork, sepia atmosphere, industrial fantasy",
  [StyleOption.VAPORWAVE]: "vaporwave aesthetic, 90s CGI surrealism, greek statues, glitch art, pastel pink and teal gradients, tropical ferns, checkerboard floors, nostalgic windows 95 vibe",
  [StyleOption.UKIYOE]: "ukiyo-e japanese woodblock print, hokusai style, flat perspective, bold outlines, textured washi paper, traditional mineral colors, wave patterns, eastern art aesthetic",
  [StyleOption.LOW_POLY]: "low poly 3d art, geometric facets, flat shading, minimal detail, sharp angles, vibrant pastel colors, isometric blender render, abstract shapes",
  [StyleOption.GOTHIC]: "dark gothic fantasy, ornate cathedral architecture, brooding atmosphere, stained glass, gargoyles, mist and shadows, dark color palette, mystical and ancient",
  [StyleOption.POP_ART]: "pop art style, roy lichtenstein dots, bold black outlines, vibrant primary colors, commercial comic strip aesthetic, high contrast, ironic mass media vibe, halftone patterns",
  [StyleOption.BAUHAUS]: "bauhaus modernist design, geometric abstraction, form follows function, clean lines, primary color palette (red yellow blue), minimalist composition, industrial graphic style",
  [StyleOption.ART_NOUVEAU]: "art nouveau style, alphonse mucha, organic flowing lines, intricate floral borders, muted gold and pastel tones, elegant and decorative, stained glass influence, romantic",
  [StyleOption.ISOMETRIC]: "isometric orthographic projection, 3d diorama, miniature world, clean lines, detailed environment, simcity aesthetic, tilt-shift effect, structural clarity",
  [StyleOption.RENAISSANCE]: "high renaissance painting, leonardo da vinci, sfumato technique, chiaroscuro lighting, anatomical realism, oil on wood texture, classical composition, dramatic drapery",
  [StyleOption.GLITCH]: "digital glitch art, datamoshing, pixel sorting, chromatic aberration, visual noise, signal corruption, distorted reality, cyberpunk error aesthetic, broken video file",
  [StyleOption.PAPERCRAFT]: "layered paper cutting art, depth and shadows, origami textures, handmade craft aesthetic, vibrant paper colors, tactile 3d effect, shadow box diorama",
  [StyleOption.GRAFFITI]: "urban street art, spray paint textures, vibrant graffiti mural, drip effects, bold tags, hip-hop culture, concrete wall background, wildstyle lettering",
  [StyleOption.STAINED_GLASS]: "stained glass window art, illuminated mosaic, vibrant translucent colors, heavy lead lines, religious or geometric patterns, light refraction, glowing glass",
  [StyleOption.SESAME]: "Sesame Street style, Jim Henson muppet aesthetic, fuzzy felt texture, foam puppets, colorful fur, googly eyes, playful television studio lighting, 1980s PBS aesthetic, fabric textures, soft focus background",
  [StyleOption.NONE]: "",
  
  // New Styles
  [StyleOption.DIORAMA]: "museum diorama, taxidermy display, natural history museum, glass case reflection, painted backdrop, realistic fur texture, still life, educational display, soft overhead spot lighting",
  [StyleOption.MINIATURE]: "hand-painted miniature wargaming figure, citadel paints style, edge highlighting, washes and shading, plastic model texture, tabletop terrain background, macro photography, depth of field, high contrast painting",
  [StyleOption.COLLAGE]: "photomontage, mixed media collage, overlapping photographs, ripped paper edges, chaotic composition, multiple perspectives, dadaist style, cut and paste aesthetic",
  [StyleOption.MOSAIC]: "organic mosaic art, arranged pebbles and tiles, natural stones, grout texture, ancient roman style, intricate geometric patterns, tactile surface, uneven handmade look",
  [StyleOption.TIE_DYE]: "tie-dye fabric pattern, psychedelic spiral, vibrant bleeding colors, hippie aesthetic, fabric texture, 60s counterculture, liquid organic shapes, saturation",
  [StyleOption.POINTILLISM]: "pointillism technique, georges seurat style, distinct small dots of color, optical blending, stippling, fine detail, vibrant luminosity, divisionism",
  [StyleOption.PS1]: "PS1 aesthetics, 32-bit graphics, affine texture mapping, jittery polygons, low resolution textures, jagged edges, dithering, 90s console gaming, CRT filter",
  [StyleOption.GUNPLA]: "gunpla plastic model kit, injection molding, panel lining, decals and stickers, articulated joints, sprue marks, scale model photography, satin finish, mecha hobby",
  [StyleOption.KAWAII]: "kawaii aesthetic, sanrio style, pastel colors, cute rounded shapes, blushing cheeks, sparkles and hearts, vector illustration, soft outlines, adorable character design",
  [StyleOption.TOULOUSE]: "henri de toulouse-lautrec style, moulin rouge poster, lithograph texture, bold silhouette, expressive outlines, flat colors, belle epoque atmosphere, cabaret art",
  
  [StyleOption.MINIMALIST]: "minimalist design, clean lines, simple forms, negative space, sparse composition, elegance, decluttered, high contrast",
  [StyleOption.CINEMATIC]: "cinematic style, dramatic film scene, 35mm photograph, anamorphic lens flare, mood lighting, professional color grading, high dynamic range",
  [StyleOption.VINTAGE]: "vintage photography, faded colors, sepia hints, warm nostalgic look, retro film grain, analog print texture, 1970s aesthetic",
  [StyleOption.THREE_D_RENDER]: "smooth 3D render, octane render style, Raytracing, pristine materials, blender cycles, stylized depth of field, digital clay model, clean geometry",
  [StyleOption.ABSTRACT]: "abstract art, non-representational, expressive shapes, geometric forms, paint splatters, modern artistic style, emotional energy, non-figurative composition",
  [StyleOption.LINE_ART]: "minimalist line art, clean vector contours, black ink on white background, simple elegant lines, no shading, precise outlines, coloring book style",
  [StyleOption.VECTOR_DESIGN]: "clean vector graphic, flat illustration, Adobe Illustrator style, bold crisp outlines, minimalist design, modern graphic art, svg feel",
  [StyleOption.NEO_NOIR]: "neo-noir film aesthetic, dramatic high-contrast lighting, harsh shadows, wet asphalt reflections, neon lights in darkness, moody rain, cinematic composition",
  [StyleOption.ART_DECO]: "art deco design style, geometric luxury, bold gold outlines, decorative symmetry, 1920s vintage elegance, sleek lines, rich ornamentation",
  [StyleOption.CUBISM]: "cubism painting style, pablo picasso style, fragmented objects, multiple viewpoints, geometric planes, abstract structural forms",
  [StyleOption.EXPRESSIONISM]: "expressionism art style, swirling distorted forms, intense emotional brushstrokes, vivid arbitrary colors, dynamic and dramatic composition",
  [StyleOption.FAUVISM]: "fauvism style, wild brushwork, vibrant saturated colors, non-naturalistic tones, expressive flat shapes, henri matisse style",
  [StyleOption.FUTURISM]: "futurism art, dynamic movement, speed lines, technological energy, overlapping shapes, industrial progress, kinetic power",
  [StyleOption.BAROQUE]: "baroque painting style, dramatic chiaroscuro, intense theatrical lighting, gold ornamentation, dynamic emotional scenes, classical luxury",
  [StyleOption.ROCOCO]: "rococo style, ornate whimsical curves, pastel colors, gold leaf filigree, lighthearted playful scenes, delicate floral motifs, luxurious elegance",
  [StyleOption.CONSTRUCTIVISM]: "russian constructivism, bold geometric shapes, red black and cream color palette, industrial propaganda graphic design, mechanical forms, strong typography layout",
  [StyleOption.POST_IMPRESSIONISM]: "post-impressionism painting, vincent van gogh style, thick structured brushstrokes, expressive bold colors, vibrant texture, emotional landscapes",
  [StyleOption.ROMANTICISM]: "romanticism art style, dramatic sublime nature, stormy sky, emotional and passionate scenes, moody dramatic landscape painting",
  [StyleOption.REALISM]: "traditional realism painting, objective representation, natural lighting, accurate detail, classic fine art gallery aesthetic",
  [StyleOption.BRUTALISM]: "brutalist design, raw exposed concrete, geometric monolithic structures, industrial raw aesthetic, cold gray tones, stark shadows",
  [StyleOption.DADA_ISM]: "dadaist art, chaotic collage, absurd juxtapositions, found object elements, anti-art philosophy, fragmented newspaper text and photography",
  [StyleOption.SYMBOLISM]: "symbolist painting, mystical dreamlike imagery, allegorical themes, dark esoteric atmosphere, poetic and spiritual metaphors",
  [StyleOption.MANNERISM]: "mannerist art style, elongated elegant figures, artificial color palettes, complex crowded compositions, dramatic unnatural poses",
  [StyleOption.PRECISIONISM]: "precisionism art style, sharp geometric forms, industrial landscapes, clean smooth surfaces, mechanical precision, urban architecture",
  [StyleOption.WESTERN]: "classic wild west style, dusty desert terrain, warm golden sun, cowboys, vintage rustic wooden saloon, film grain, tumbleweed aesthetic",
  [StyleOption.NINJA]: "ninja style, shadow warrior, black shinobi gear, moonlit night, traditional feudal japanese architecture, katana blade, silent stealthy mood",
  [StyleOption.SAMURAI]: "samurai warrior aesthetic, ornate traditional armor, cherry blossoms falling, dramatic lighting, historic feudal japan, ukiyo-e influence",
  [StyleOption.PIRATE]: "pirate theme, high seas adventure, weathered treasure map, old wooden galleon ship, skull and crossbones flag, tropical tropical island, golden doubloons, misty ocean",
  [StyleOption.VIKING]: "viking warrior style, rugged norse aesthetics, longships in foggy fjords, runestones, fur and iron armor, stormy dark skies, epic fantasy",
  [StyleOption.KNIGHT]: "noble knight, shining steel armor, royal castle background, dynamic battlefield scene, heraldry flag, high fantasy adventure, epic chivalric pose",
  [StyleOption.MECHA]: "giant mecha robot, high-tech armor plating, glowing power cores, sci-fi hangar bay, industrial scale, complex mechanical joints, anime style",
  [StyleOption.KAIJU]: "giant kaiju monster, tokusatsu style, city destruction scenes, smoke and fire, cinematic scale, high-voltage action, miniature model style",
  [StyleOption.ZOMBIE]: "zombie horror style, decayed textures, post-apocalyptic city, eerie green mist, dramatic dark shadows, survival thriller atmosphere",
  [StyleOption.RETRO_FUTURISM]: "retro-futurism, 1950s atomic age style, sleek flying cars with tailfins, chrome domes, bubbly space helmets, optimism, fallout aesthetic",
  [StyleOption.POST_APOCALYPTIC]: "post-apocalyptic wasteland, ruined overgrown skyscrapers, dusty sandstorms, rusted metal scavengers, survivalist gear, dramatic desolate mood",
  [StyleOption.DIESELPUNK]: "dieselpunk style, 1940s industrial sci-fi, retro-futuristic war machines, heavy steel rivets, soot and oil, retro-deco styling, gritty atmosphere",
  [StyleOption.SOLARPUNK]: "solarpunk aesthetic, eco-futuristic city, lush vertical gardens, sleek wind turbines, stained glass solar panels, warm optimistic sunlight, harmony with nature",
  [StyleOption.SPACE_OPERA]: "epic space opera, interstellar armada ships, alien worlds with dual moons, nebulae background, futuristic lasers, grand sci-fi adventure",
  [StyleOption.COSMIC_HORROR]: "lovecraftian cosmic horror, eldritch monstrosities, swirling non-euclidean voids, dark purple and green palette, eerie glowing eyes, impending dread",
  [StyleOption.FAIRYTALE]: "fairytale illustration, whimsical enchanted forest, magical glowing mushrooms, storybook charm, soft painterly style, cute forest creatures",
  [StyleOption.HIGH_FANTASY]: "epic high fantasy, majestic elven spires, glowing magical runes, legendary swords, sweeping fantasy landscape, rich mythic lore",
  [StyleOption.CYBERNETIC]: "cybernetic enhancements, glowing neural pathways, sleek carbon fiber prosthesis, bio-hacking, futuristic lab, augmented reality overlay",
  [StyleOption.PREHISTORIC]: "prehistoric age, lush primeval jungle, roaming dinosaurs, volcanic backdrop, raw untamed nature, prehistoric atmosphere",
  [StyleOption.EIGHT_BIT]: "8-bit NES style, low resolution pixel sprites, limited color palette, blocky retro tiles, nostalgic chiptune game aesthetic",
  [StyleOption.SIXTEEN_BIT]: "16-bit SNES style, polished pixel art, detailed retro backgrounds, vibrant parallax layering, nostalgic console game",
  [StyleOption.VOXEL]: "voxel art style, blocky 3D cube world, minecraft aesthetic, stylized 3D models, vibrant colors, clean lighting",
  [StyleOption.CEL_SHADED]: "cel-shaded 3D art, bold black ink outlines, flat color gradients, anime game render, genshin impact aesthetic, clean stylized look",
  [StyleOption.ARCADECORE]: "arcadecore aesthetic, glowing neon cabinets, retro neon carpet patterns, token dispensers, dark arcade room, nostalgic 80s gamer vibe",
  [StyleOption.CHIBI]: "chibi anime style, cute super-deformed characters, oversized expressive heads, tiny bodies, adorable round faces, soft pastel colors",
  [StyleOption.NEXT_GEN]: "next-gen video game graphics, unreal engine 5, ray-traced ambient occlusion, subsurface scattering, photorealistic textures, high-fidelity render",
  [StyleOption.DARK_FANTASY]: "dark fantasy style, gothic cathedral spires, dark magic, grim-dark aesthetic, armor, glowing eerie eyes, desolate ruins, dramatic fog",
  [StyleOption.COZY_GAMING]: "cozy gaming aesthetic, warm soft lighting, cute pastel desk setup, indoor plants, soothing ambient glow, lo-fi music vibe, gentle and relaxing",
  [StyleOption.RGB_GAMER]: "RGB gamer style, intense neon backlights, liquid cooling tube glow, high-tech PC battlestation, glowing mechanical keyboard, dark gaming room",
  [StyleOption.RAY_TRACED]: "ultra high-end ray-traced render, realistic reflections, glassy refractions, indirect bounce lighting, flawless lighting accuracy, photorealistic materials",
  [StyleOption.HIGH_POLY]: "high-poly 3D model, intricate geometric detail, subdivision surface, high-fidelity digital sculpt, zbrush model, pristine detailing",
  [StyleOption.HAND_PAINTED]: "hand-painted texture style, stylized WoW model aesthetic, cozy painted surfaces, visible artistic brushmarks, warm fantasy illustration",
  [StyleOption.FLAT_VECTOR]: "flat vector design, clean bold solid shapes, minimalist illustration, corporate memphis style, no gradients, crisp vector graphics",
  [StyleOption.MONOCHROMATIC]: "monochromatic style, single color family palette, dramatic tone gradients, clean minimalist harmony, high aesthetic value",
  [StyleOption.ASCII_ART]: "ASCII text art, green phosphor retro terminal computer text characters, matrix console screen, digital typing aesthetic",
  [StyleOption.PC_98]: "vintage Japanese PC-98 game style, 16-color dithering, retro anime graphics, nostalgic visual novel pixel art, CRT scanlines",
  [StyleOption.SYNTHWAVE]: "synthwave aesthetic, glowing neon grid landscape, wireframe mountains, outrun sunset, retro-futuristic 1980s music cover",
  [StyleOption.COTTAGECORE]: "cottagecore aesthetic, rustic flower garden, wooden cottage, cozy tea set, vintage rural lifestyle, warm soft natural daylight",
  [StyleOption.DARK_ACADEMIA]: "dark academia aesthetic, gothic brick libraries, ancient leather books, candlelit study desks, classical sculptures, moody intellectual vibe",
  [StyleOption.LIGHT_ACADEMIA]: "light academia style, sunlit marble halls, classical literature, beige and cream color palette, soft focus academic daydream, aesthetic notebooks",
  [StyleOption.Y2K]: "Y2K futurism style, metallic silver fabrics, inflatable plastic chairs, bubblegum pink and icy blue, translucent tech gadgets, early 2000s optimistic aesthetic",
  [StyleOption.FRUTIGER_AERO]: "frutiger aero aesthetic, glossy plastic textures, grassy hills, bubbles, clean blue skies, glass interfaces, optimistic 2000s tech vibe, tropical fish",
  [StyleOption.WEIRDCORE]: "weirdcore aesthetic, low-res surreal dream images, floating text, vintage 90s digital camera flash, liminal spaces, unsettling dream nostalgia",
  [StyleOption.DREAMCORE]: "dreamcore aesthetic, surreal pastel clouds, floating doors and eyes, nostalgic liminal playground, dreamy comforting-yet-eerie subconscious realm",
  [StyleOption.LIMINAL_SPACE]: "liminal space photography, empty nostalgic corridors, fluorescent lighting, deserted school hallway, unsettling quiet, transition spaces",
  [StyleOption.GOBLINCORE]: "goblincore style, mossy logs, wild mushrooms, shiny rocks and keys, forest floor, mud, earthy organic clutter",
  [StyleOption.CLUTTERCORE]: "cluttercore, cozy maximalist room, shelves packed with vintage trinkets, plants, polaroids, colorful cozy chaos, warm aesthetic clutter",
  [StyleOption.MAXIMALISM]: "maximalist style, explosion of bold patterns, rich jewel tones, eclectic overlapping art pieces, luxurious dense interior design, visual feast",
  [StyleOption.WHIMSIGOTH]: "whimsigoth aesthetic, velvet celestial patterns, crescent moons, crystal balls, witchy dark rich tones, bohemian gothic mysticism",
  [StyleOption.COQUETTE]: "coquette aesthetic, delicate pink bows, lace textures, vintage pearls, soft pastel romanticism, sweet feminine details, dreamlike lighting",
  [StyleOption.KIDCORE]: "kidcore style, primary toy colors, building blocks, rainbows, cartoon stickers, playful nostalgic 95 playground vibe",
  [StyleOption.INDIE_SLEAZE]: "indie sleaze aesthetic, raw flash polaroid snapshot, messy eyeliner, party night, analog film grain, retro grunge hipster vibe",
  [StyleOption.GORPCORE]: "gorpcore style, utilitarian technical outerwear, hiking gear, mountain peaks in fog, outdoorsy trail aesthetic, functional ripstop textures",
  [StyleOption.NORMCORE]: "normcore style, simple ordinary clothing, neutral grey tones, suburban casual minimalism, unpretentious daily life photography",
  [StyleOption.GLITCHCORE]: "glitchcore style, hyper-saturated digital static, chaotic overlays, extreme visual noise, rainbow neon distortion, internet error art",
  [StyleOption.WES_ANDERSON]: "wes anderson cinematic style, perfect symmetrical composition, vintage warm color palette, whimsical pastel colors, quirky cinematic frame",
  [StyleOption.KUBRICKIAN]: "stanley kubrick movie scene, perspective vanishing point, cold calculated framing, high-contrast dramatic color palette, cinematic dread, masterpiece cinematography",
  [StyleOption.LYNCHIAN]: "david lynch cinematic style, red velvet drapes, eerie neon lighting, dreamlike surreal mystery, uncanny valley, moody cinematic noir",
  [StyleOption.BURTONESQUE]: "tim burton style, dark whimsical gothic, crooked gothic houses, striped spiral hills, pale-skinned characters, eerie dark fairytale atmosphere",
  [StyleOption.GRINDHOUSE]: "grindhouse cinema style, heavy scratches, dust and hair on film lens, dirty high-contrast B-movie grading, retro thriller action poster look",
  [StyleOption.GIALLO]: "classic giallo movie frame, intense primary color filters, dramatic shadows, stylish murder mystery atmosphere, 1970s Italian horror cinematography",
  [StyleOption.TECHNICOLOR]: "classic 1950s technicolor film print, highly saturated primary colors, glorious glowing vintage movie look, rich warm tones",
  [StyleOption.ART_HOUSE]: "art house cinema style, high artistic merit, poetic visual pacing, minimalist camera shots, subtle naturalistic lighting, indie film atmosphere",
  [StyleOption.CLASSIC_HOLLYWOOD]: "classic hollywood cinema, glamorous black and white film grain, soft diffusion filter, dramatic master key lighting, vintage studio portraits",
  [StyleOption.FOUND_FOOTAGE]: "found footage horror aesthetic, shaky handheld VHS recording, night-vision green glow, grain, timestamp HUD overlay, terrifying realism",
  [StyleOption.CINEMA_VERITE]: "cinema verite, documentary realism, raw unposed candid moments, natural handheld camera, authentic raw film lighting",
  [StyleOption.TECH_NOIR]: "tech-noir film style, cyber-dystopia noir, dim-lit terminal screens, glowing cyan neon raindrops, rainy futuristic city shadows",
  [StyleOption.SPAGHETTI_WESTERN]: "spaghetti western movie frame, extreme close-up of eyes, dusty desert sun, hot sweaty grit, vintage sepia color grading, vintage widescreen",
  [StyleOption.SLASHER]: "vintage 80s slasher movie, retro horror vibe, grainy low-budget film look, dark atmospheric woods, dramatic flashlights",
  [StyleOption.STOP_MOTION_FILM]: "stop-motion clay puppet, tactile textures, handmade miniature physical sets, slightly jittery framerate, charming craft aesthetic",
  [StyleOption.TARANTINO]: "quentin tarantino movie frame, low-angle trunk shot, vibrant warm colors, high-contrast dialogue scene, cinematic action cool",
  [StyleOption.A24]: "A24 movie aesthetic, indie film cinematography, gorgeous moody color grading, natural light flares, artistic slow-burn atmosphere",
  [StyleOption.MOCKUMENTARY]: "mockumentary TV show style, handheld documentary camera zoom, office fluorescent lighting, awkward candid portrait look",
  [StyleOption.NEO_REALISM]: "italian neorealism style, gritty post-war urban streets, raw black and white film, non-professional actors, real life struggle, naturalistic lighting",
  [StyleOption.BLAXPLOITATION]: "1970s blaxploitation movie poster style, hyper-stylized action, vibrant gritty warm colors, vintage cinema print texture, funk soul album cover art",
  [StyleOption.CEREAL_BOX]: "retro cereal box packaging, colorful cartoon mascot, high-contrast retro printing, wacky typography, 90s breakfast box aesthetic",
  [StyleOption.POLAROID_FRAME]: "polaroid frame photograph, authentic white border, retro instant camera colors, soft flash lighting, faded nostalgic colors",
  [StyleOption.MAGAZINE_COVER]: "glossy magazine cover layout, bold headline typography, fashion portrait photoshoot, elegant editorial style",
  [StyleOption.TRADING_CARD]: "vintage collectible trading card, retro cardboard print texture, border frame layout, stats panel, holographic foil pattern",
  [StyleOption.COMIC_PANEL]: "classic comic book panel, black ink outlines, halftone dot shading, speech bubble layout, vibrant dramatic action illustration",
  [StyleOption.POSTAGE_STAMP]: "vintage postage stamp border, perforated jagged edges, classic engraved printing design, official country logo",
  [StyleOption.MOVIE_POSTER]: "epic cinematic movie poster design, dramatic title typography, cast listing block, high-impact composite artwork",
  [StyleOption.VINYL_SLEEVE]: "12-inch vinyl record sleeve cover, artistic abstract album art, retro cardboard texture, musical indie band release style",
  [StyleOption.VHS_COVER]: "vintage VHS tape box cover, plastic sleeve texture, retro 80s blocky title art, home video layout, worn corners",
  [StyleOption.WANTED_POSTER]: "wild west wanted poster, aged crinkled parchment paper, faded black ink print, rustic western typography, outlaw bounty text",
  [StyleOption.TAROT_CARD]: "mystical tarot card design, ornate symbolic border frame, esoteric medieval illustrations, major arcana title block",
  [StyleOption.NEWSPAPER_PRINT]: "vintage newspaper print texture, halftone print photo, ink smudge dots, column layout, faded newsprint paper",
  [StyleOption.POSTCARD_BORDER]: "vintage postcard design, white border frame, retro holiday destination travel greeting, faded analog photography",
  [StyleOption.BLISTER_PACK]: "plastic toy blister pack packaging, cardboard backer card art, glossy vacuum-sealed plastic cover, retro action figure box",
  [StyleOption.PASSPORT_PHOTO]: "official passport photo, neutral gray background, harsh camera flash, front-facing straight face, photobooth print texture",
  [StyleOption.VIEW_MASTER]: "vintage 3D view-master stereoscope disc slide, circular frame, retro plastic model color slides, nostalgic childhood toy look",
  [StyleOption.BILLBOARD]: "giant outdoor highway billboard, towering metal scaffolding structure, printed canvas vinyl texture, dramatic scale",
  [StyleOption.BOOK_JACKET]: "hardcover book jacket cover design, title typography, elegant modern literary illustration, paper dust jacket texture",
  [StyleOption.WINE_LABEL]: "elegant wine bottle label, textured cream paper, gold foil embossed details, classical vineyard engraving, luxury typography",
  [StyleOption.ARCADE_CABINET]: "arcade machine side art, retro arcade cabinet design, glowing CRT monitor bezel, joystick controls",
  [StyleOption.MATTE]: "non-reflective matte surface texture, soft diffused lighting, flat finish, sophisticated zero-glare studio environment",
  [StyleOption.GLOSSY]: "high-gloss ultra reflective surface, shiny wet lacquer, brilliant highlights, polished mirror glaze finish",
  [StyleOption.BRUSHED_METAL]: "brushed aluminum metal texture, fine linear scratching, industrial titanium metallic sheen, realistic specular highlights",
  [StyleOption.CRUMPLED_PAPER]: "crumpled paper texture, deep white folds and creases, shadow depth, tactile handmade paper, organic material",
  [StyleOption.FROSTED_GLASS]: "frosted translucent glass plate, beautiful glass refraction, blurry background, elegant sleek modern design",
  [StyleOption.LIQUID_CHROME]: "liquid chrome metal texture, flowing shiny mercury, surreal organic metallic reflections, high specular shine",
  [StyleOption.GOLD_LEAF]: "crinkled gold leaf texture, metallic gold foil flakes, luxury shimmering gold accents, metallic textured surface",
  [StyleOption.CARBON_FIBER]: "carbon fiber weave pattern, high-tech dark gray composite material, glossy sports car panel texture",
  [StyleOption.MARBLE]: "luxurious white carrara marble texture, intricate grey veins, polished stone floor surface, clean elegant architecture",
  [StyleOption.CONCRETE]: "brutalist raw poured concrete texture, grey cement pores, construction board lines, realistic rough wall surface",
  [StyleOption.WOOD_GRAIN]: "natural wood grain texture, warm cedar timber plank lines, organic tree knots, polished carpentry finish",
  [StyleOption.DISTRESSED_LEATHER]: "distressed brown leather texture, worn cowhide creases, vintage leather jacket material, rich organic surface",
  [StyleOption.CRACKED_PAINT]: "peeling cracked paint texture, dry weathered wood surface, chipping paint fragments, rustic decay",
  [StyleOption.RUST_PATINA]: "rusted weathered metal texture, orange iron oxide patina, decayed industrial steel plate, rich decay textures",
  [StyleOption.CANVAS_FABRIC]: "coarse woven cotton canvas fabric texture, artistic gesso paint base, tactile textile background",
  [StyleOption.DENIM]: "rugged blue denim fabric weave, classic indigo jeans textile texture, rugged cloth material",
  [StyleOption.VELVET]: "luxurious plush velvet fabric, deep rich colors, soft velvet shadow falloffs, luxurious textile",
  [StyleOption.TERRAZZO]: "terrazzo stone pattern, colorful polished marble chips, mosaic cement aggregate floor tile design",
  [StyleOption.STUCCO]: "rough white stucco plaster wall texture, exterior building plaster finish, rustic architectural coating",
  [StyleOption.GRAPHITE]: "fine graphite pencil lead shading, precise silver-grey sketch work, metallic pencil sheen, artist sketchbook sketch",
  [StyleOption.COLORED_PENCIL]: "colored pencil drawing, visible wax pencil strokes, hand-shaded paper texture, colorful sketchbook sketch",
  [StyleOption.CHALK_PASTEL]: "dry chalk pastel drawing, powdery texture, soft blended smudges, vibrant artistic paper illustration",
  [StyleOption.OIL_PASTEL]: "thick oil pastel painting, heavy waxy strokes, vibrant rich textured colors, expressive child-like or professional art",
  [StyleOption.ACRYLIC_PAINT]: "vibrant acrylic painting, quick-dry brushstroke layers, modern plastic color texture, canvas art",
  [StyleOption.GOUACHE]: "matte opaque gouache painting, flat beautiful color blocks, poster paint illustration style, velvety finish",
  [StyleOption.TEMPERA]: "medieval egg tempera painting on wood, gold leaf backgrounds, flat historic religious renaissance style",
  [StyleOption.INK_WASH]: "traditional ink wash painting, monochromatic black ink bleeding, water dilution gradients, expressive brush calligraphy",
  [StyleOption.ETCHING]: "fine line steel etching print, cross-hatched engraved shading, antique book illustration, ink plate print texture",
  [StyleOption.LINOCUT]: "bold blocky linocut print art, carved linoleum block ink print, retro handmade graphic, organic hand-carved edges",
  [StyleOption.WOODCUT]: "classic woodcut print style, raw carved wood block texture, bold black ink lines, historic renaissance printing",
  [StyleOption.SCREENPRINT]: "silkscreen print poster, solid graphic ink layers, misregistered colors, retro pop-art print texture",
  [StyleOption.LITHOGRAPH]: "antique stone lithograph print, hand-drawn grease pencil texture, classic 19th-century paper print art",
  [StyleOption.AIRBRUSH]: "retro 80s airbrush art, smooth color gradients, chrome text style, clean slick graphic illustration",
  [StyleOption.SCRATCHBOARD]: "scratchboard engraving art, white lines scratched out of black background, dramatic high-contrast detail, ink sketch",
  [StyleOption.TROMPE_LOEIL]: "trompe-l’œil trick of the eye realistic painting, realistic illusion of 3D objects popping off flat surface, ultra realistic shadow depth",
  [StyleOption.CHIAROSCURO]: "chiaroscuro painting style, heavy dramatic contrast, deep shadows, bright spotlighting, classic Caravaggio painting feel",
  [StyleOption.HYPERREALISM]: "hyperrealistic portrait photography, extreme detail down to skin pores, perfect macro studio lighting, incredible real life precision",
  [StyleOption.SUMI_E]: "japanese sumi-e wash ink art, zen minimalist master brushwork, black ink bleed on raw rice paper",
  [StyleOption.PRE_RAPHAELITE]: "pre-raphaelite painting style, rich medieval fantasy detail, long flowing hair, vibrant botanical realism, romantic dreamscape",
  [StyleOption.NEOCLASSICISM]: "neoclassical oil painting style, heroic figures, clean statuesque form, patriotic classical greek roman historic scene, formal elegance",
  [StyleOption.TENEBRISM]: "tenebrism painting style, pitch-black deep background, extreme high-contrast dramatic spotlight, moody Caravaggio masterpiece",
  [StyleOption.STIPPLING]: "fine stippling ink drawing, thousands of tiny hand-dotted ink dots, detailed shading gradients, vintage book illustration",
  [StyleOption.INTRICATE_FILIGREE]: "intricate gold filigree lace patterns, ornate medieval metalwork, swirling decorative metal lines",
  [StyleOption.KINTSUGI]: "kintsugi art, beautiful gold lacquer repair cracks, repaired pottery cracks, golden seams, elegant raw beauty",
  [StyleOption.CHINOISERIE]: "chinoiserie decorative pattern, ornate oriental floral borders, golden phoenix birds, luxury hand-painted wallpaper",
  [StyleOption.ILLUMINATED_MANUSCRIPT]: "medieval illuminated manuscript page, ornate hand-lettering calligraphy, gold leaf accents, decorative border frames",
  [StyleOption.FINE_LINE_ENGRAVING]: "fine-line vintage banknote engraving art, steel plate printing lines, micro-detailed crosshatching",
  [StyleOption.CLOISONNE]: "cloisonné enamel metalwork, wire-bounded colored enamel cells, vibrant glossy gold borders, traditional decorative art",
  [StyleOption.SFUMATO]: "sfumato technique, hazy soft-focus color blending, dreamy shadows, classical mona lisa painting style",
  [StyleOption.GOTHIC_REVIVAL]: "gothic revival architecture, towering ornate spires, vaulted arched ceilings, dark wood paneling, dark romantic aesthetic",
  [StyleOption.ISLAMIC_GEOMETRIC]: "intricate islamic geometric tile pattern, mathematical symmetrical arabesque star motifs, vibrant ceramic tiles",
  [StyleOption.NEURAL_BAROQUE]: "neural baroque generative AI art, liquid gold wires, organic neural pathways growing into baroque ornate gold frames",
  [StyleOption.QUANTUM_GLITCH]: "quantum glitch art, holographic digital interference patterns, glowing laser subatomic particles, subatomic matrix error",
  [StyleOption.BIO_SYNTHETIC]: "bio-synthetic organic art, glowing neon veins running through translucent biosynthetic plants, cyborg biology",
  [StyleOption.ALGORITHMIC_BRUTALISM]: "algorithmic brutalist design, monolithic raw concrete structures wrapped in mathematical wireframe patterns, code block architecture",
  [StyleOption.PHYGITAL_CRAFT]: "phygital craft style, fusion of real tactile papercraft and glossy glowing 3D vector graphics, hybrid aesthetic",
  [StyleOption.LATENT_SURREALISM]: "latent space dream landscape, morphing organic shapes, hyper-detailed generative ai hallucination, surrealism",
  [StyleOption.DATA_SCULPTURE]: "digital data sculpture, fluid ribbon waves of glowing data streams, 3D volumetric laser installation",
  [StyleOption.CYBER_BIOPHILIA]: "cyber-biophilic design, bioluminescent house plants growing into smart holographic computer desks",
  [StyleOption.LIQUID_GEOMETRY]: "glowing liquid chrome geometric shapes melting into fluid metallic puddles, high specular shine",
  [StyleOption.HYPER_DIMENSIONAL]: "hyper-dimensional space, tesseract folding pathways, glowing wormhole portals, infinite perspective grid",
  [StyleOption.SPECTRAL_DIGITAL]: "spectral digital neon colors, rainbow oil slick sheen on dark digital screens, iridescent laser light",
  [StyleOption.NANO_CHIC]: "nano-chic high-tech fashion, glowing microchips and flexible circuit lines woven into futuristic metallic fabrics",
  [StyleOption.PLASMATIC]: "glowing plasmatic energy fields, organic swirls of fluid laser light, electrical discharge aesthetic",
  [StyleOption.NEURO_EXPRESSIONISM]: "neuro-expressionist abstract oil painting, heavy emotional brushstrokes blending into digital glowing circuit lines",
  [StyleOption.CHRONOSTATIC]: "chronostatic temporal freeze, objects frozen mid-explosion in crystal clear water droplets, time-slice photography",
  [StyleOption.VOXEL_FLUID]: "voxel fluid simulation, thousands of tiny colorful digital cubes flowing like liquid splash, retro game voxel design",
  [StyleOption.META_TEXTURAL]: "meta-textural render, collage of contrasting textures like rough raw concrete next to smooth glossy liquid gold leaf and denim fabric",
  [StyleOption.ECHOCORE]: "echocore aesthetic, infinite echoing mirror reflections, misty emerald forest trails, ambient sound wave visualizations",
  [StyleOption.SYNTH_ORGANIC]: "synth-organic hybrid art, growing tree root networks merged with futuristic fiber-optic wire glow",
  [StyleOption.GENERATIVE_GOTHIC]: "generative gothic design, mathematical algorithms creating intricate dark gothic cathedral arches",
  [StyleOption.BENTO_GRID]: "clean bento grid layout design, modular compartments displaying neat aesthetic content elements",
  [StyleOption.SPLIT_SCREEN]: "split-screen diptych composition, two contrasting side-by-side scenes separated by a clean central line",
  [StyleOption.ASYMMETRIC]: "asymmetrical layout, dynamic off-center focal point, bold unbalanced negative space",
  [StyleOption.MODULAR]: "modular grid block layout, sleek clean panels displaying organized modern design assets",
  [StyleOption.WHITESPACE]: "generous whitespace design, high focus minimalist center subject, massive breathing negative space room",
  [StyleOption.EDITORIAL_SPREAD]: "professional magazine editorial spread, elegant title typography layout paired with high-end editorial photo",
  [StyleOption.TRIPTYCH]: "triptych three-panel frame composition, three sequential storytelling scene panels, artistic storyboard",
  [StyleOption.DIPTYCH]: "diptych two-panel photography print, side-by-side storytelling image panels",
  [StyleOption.RADIAL_SYMMETRIC]: "perfect radial symmetry design, circular kaleidoscope patterns spiraling from center focus point",
  [StyleOption.BROKEN_GRID]: "broken grid graphic design layout, overlapping text and image blocks, avant-garde editorial look",
  [StyleOption.GOLDEN_RATIO]: "golden ratio spiral composition, perfectly balanced mathematical aesthetic proportion framing",
  [StyleOption.HIERARCHICAL]: "hierarchical scale composition, huge imposing central subject next to small scale figures",
  [StyleOption.OVERLAPPING]: "overlapping layered shapes design, multi-exposure transparent silhouette vectors, collage depths",
  [StyleOption.SWISS_STYLE]: "swiss style international typographic layout, bold sans-serif lettering, strict clean grids, flat red accents",
  [StyleOption.CARD_LAYOUT_STYLE]: "modern card layout UI, glowing rounded slate cards floating over empty dark space",
  [StyleOption.COLUMNAR]: "columnar layout, elegant neoclassical column panels dividing the visual scene",
  [StyleOption.STORYBOARD]: "storyboard layout, multi-frame sketch sequence panels illustrating movie scene progression",
  [StyleOption.MULTIPANEL]: "multipanel grid layout, comic book frame blocks displaying detailed sequential art",
  [StyleOption.Z_PATTERN]: "Z-pattern reading layout, leading the eye with diagonal lines from top-left to bottom-right",
  [StyleOption.CENTRAL_FOCUS]: "central focus framing, dramatic vignetted margins pointing directly to beautiful central subject",
  [StyleOption.ABSTRACT_EXPRESSIONISM]: "abstract expressionism, jackson pollock style paint drips, chaotic energetic splatters, giant canvas fine art",
  [StyleOption.OP_ART]: "op art optical illusion style, black and white dizzying spiral lines, mesmerizing geometric distortion",
  [StyleOption.SUPREMATISM]: "suprematism art, kazimir malevich style, floating geometric flat squares, rectangles, circles on cream background",
  [StyleOption.DE_STIJL]: "de stijl design, piet mondrian style, primary color blocks (red blue yellow), bold black grid lines, minimalist abstraction",
  [StyleOption.CONCEPTUAL_ART]: "conceptual art installation, thought-provoking simple objects in white gallery space with museum display labels",
  [StyleOption.ARTS_AND_CRAFTS]: "arts & crafts movement style, william morris floral wallpapers, woodblock textile designs, ornate nature-inspired design",
  [StyleOption.REGIONALISM]: "american regionalist painting, grant wood style, midwestern farm life, rural simplicity, historic americana",
  [StyleOption.HUDSON_RIVER_SCHOOL]: "hudson river school landscape painting, sweeping majestic valleys, dramatic sunset glow, grand wild nature, sublime atmosphere",
  [StyleOption.NEO_EXPRESSIONISM]: "neo-expressionist painting style, jean-michel basquiat style, raw expressive scribbles, chaotic text, bold street-art crown motifs",
  [StyleOption.ARTE_POVERA]: "arte povera style, raw humble materials like burlap, wood branches, dirt, coal arranged in high-end modern gallery",
  [StyleOption.SOCIAL_REALISM]: "social realist painting, working class struggle, industrial miners, raw human struggle, gritty mid-century americana",
  [StyleOption.ORPHISM]: "orphism painting, robert delaunay style, colorful overlapping geometric circles, vibrant musical abstraction",
  [StyleOption.VIENNA_SECESSION]: "vienna secession art style, gustav klimt gold leaf ornamentation, decorative mosaic patterns, elegant symbolic figures",
  [StyleOption.LES_NABIS]: "les nabis painting style, flat simplified colors, bold outlines, cozy domestic scenes, symbolist influence",
  [StyleOption.ASHCAN_SCHOOL]: "ashcan school painting style, gritty turn-of-the-century new york city life, dark alleyways, realistic city workers",
  [StyleOption.FLUXUS]: "fluxus avant-garde art, interactive instruction cards, absurd objects, performance art documentations",
  [StyleOption.ART_INFORMEL]: "art informel painting, raw textured canvas, thick impasto slate palette, abstract material painterly chaos",
  [StyleOption.SYNCHROMISM]: "synchromism art, vibrant overlapping color chords, dynamic abstract patterns representing color harmonies",
  [StyleOption.SPATIALISM]: "lucio fontana spatialism, sliced canvas, cuts and holes in solid color painted canvas, dramatic deep shadow gaps",
  [StyleOption.COLORING_BOOK]: "black and white coloring book page, clean thick outlines, pure white spaces, ready for coloring, no shading",
  [StyleOption.ROYAL_PORTRAIT]: "majestic royal portrait painting, ornate golden crown, red velvet cape, holding scepter, classical oil painting on canvas",
  [StyleOption.STICKER_CUTOUT]: "cute cartoon sticker design, bold outline border, white die-cut margins, clean decal graphic",
  [StyleOption.BRICK_FIGURINE]: "brick figurine toy collectible, lego block style plastic figure, yellow plastic hands, cute blocky toy",
  [StyleOption.TOY_COLLECTIBLE]: "designer vinyl art toy collectible, kidrobot style, clean smooth synthetic surfaces, designer toy packaging",
  [StyleOption.EMBROIDERY_PATCH]: "embroidered thread patch, dense needlework stitching texture, raised fabric border frame, merit badge design",
  [StyleOption.KNITTED_PLUSH]: "cozy knitted yarn plush toy, amigurumi crochet texture, fuzzy woven yarn stitch details, adorable stuffed animal",
  [StyleOption.PAPER_CUTOUT]: "handmade paper cutout layered card, physical layered 3D depth, colored cardstock papercraft art",
  [StyleOption.NEON_SIGN]: "glowing glass neon sign, bright electric light tubes, glowing over brick wall, night diner aesthetic",
  [StyleOption.CHALKBOARD_SKETCH]: "white chalkboard sketch, chalk dust texture, hand-drawn on dark blackboard menu",
  [StyleOption.CARICATURE_AVATAR]: "funny cartoon caricature avatar, exaggerated facial features, big expressive smile, colorful digital art profile",
  [StyleOption.WATERCOLOR_SPLASH]: "artistic watercolor paint splash, wet-on-wet watercolor bleeding, messy artistic splatters, soft colorful pigment drops",
  [StyleOption.COMIC_HALFTONE]: "vintage comic book halftone print dot style, bold inks, retro retro pop art action scene",
  [StyleOption.LASER_ENGRAVE]: "laser-engraved wood board art, burnt wood shading, precise detailed woodcut design",
  [StyleOption.SAND_ART]: "sand bottle art painting, layered colorful sand grains, physical sand texture landscape",
  [StyleOption.GLOW_OUTLINE]: "bright glowing neon line outline, dark wireframe vector, glowing blueprint schematic",
  [StyleOption.SCRATCH_ART]: "colorful scratch art, neon rainbow lines scratched out from solid black wax coating",
  [StyleOption.VINTAGE_CARTOON]: "vintage 1930s cartoon, cuphead aesthetic, black-and-white film scratches, rubber hose animation bounce",
  [StyleOption.MANGA_AVATAR]: "manga avatar illustration, black and white ink pen lines, screentone shading dots, classic anime portrait",
  [StyleOption.SILHOUETTE_ART]: "silhouette paper art, solid black shapes against beautiful glowing twilight sky backdrop",
  [StyleOption.HOLOGRAPHIC_BILLBOARD]: "holographic glowing floating advertisement billboard, projection rays in rainy cyber city",
  [StyleOption.RETRO_BILLBOARD]: "1950s hand-painted roadside billboard, weathered wooden frame, retro travel advertisement, faded colors",
  [StyleOption.TIMES_SQUARE]: "times square giant advertising screens, glowing digital billboards, yellow cabs, glowing night lights",
  [StyleOption.NEON_MARQUEE]: "glowing retro theater neon marquee board, vintage flashing lightbulbs, glowing neon typography",
  [StyleOption.BUS_SHELTER]: "city bus shelter poster display case, glowing advertisement poster under glass panel at night",
  [StyleOption.HEDGE_MAZE]: "lush green hedge maze labyrinth, top-down orthographic perspective, secret garden hedge walls",
  [StyleOption.LABYRINTH_GRID]: "cyber neon labyrinth grid pathways, glowing futuristic circuit board layout",
  [StyleOption.CIRCUIT_MAZE]: "glowing gold computer circuit board maze pattern, high-tech silicon wafer traces",
  [StyleOption.VECTOR_MAZE]: "clean flat vector illustration of puzzle maze board, colorful simple vector puzzle layout",
  [StyleOption.PUZZLE_MATRIX]: "3D puzzle box matrix cubes, intricate high-tech puzzle box mechanical lock gears",
  [StyleOption.JRPG_RETRO]: "retro 16-bit JRPG battle screen HUD, retro pixel characters, menu text dialogue boxes",
  [StyleOption.SURVIVAL_HORROR]: "vintage ps1 survival horror game screen, fixed camera angle, grainy security monitor feed, dark gloomy corridor",
  [StyleOption.VISUAL_NOVEL]: "visual novel anime dialog game scene, detailed background, foreground character dialogue box text overlay",
  [StyleOption.COZY_SIM]: "cozy life simulator game screen, cute animal neighbors, detailed room decorating, soft cozy daylight",
  [StyleOption.FPS_HUD]: "first-person shooter gameplay perspective screen, weapon models in hand, ammo and health status bar HUD overlay",
  [StyleOption.PLATFORMER_LEVEL]: "side-scrolling 2D game platformer level design, floating dirt blocks, coin pickups, cute game character",
  [StyleOption.FIGHTING_GAME]: "retro fighting game screen, health bars HUD overlay, side-view duel battle arena",
  [StyleOption.METROIDVANIA_MAP]: "metroidvania styled game map grid HUD screen, secret corridors, multi-colored grid compartments",
  [StyleOption.ROGUE_LIKE]: "rogue-like dungeon grid map layout, retro ASCII game graphics, tiny item symbols",
  [StyleOption.ARCADE_UI]: "arcade game start machine selection screen interface layout, glowing INSERT COIN text neon",
  [StyleOption.DIGIMON_DIGIVOLUTION]: "retro anime digital evolution wireframe sphere matrix, glowing green circuit grid digital space background"
};

export const constructEnrichedPrompt = (params: GenerationParams, point: Point): string => {
  const { prompt, styleA, styleB, negativePrompts, colorPalette, lighting, depthOfField, colorCount } = params;
  const { x: matrixX, y: matrixY } = point;
  
  // Structured Prompt Construction
  const sections: string[] = [];

  // 1. CORE SUBJECT
  sections.push(`[SUBJECT]\n${prompt}`);

  // 2. STYLE MATRIX & MIXING (High Precision)
  const styleDirectives: string[] = [];
  const negativeStyleDirectives: string[] = [];
  
  const processStyleAxis = (styleName: string, intensity: number) => {
      if (styleName === StyleOption.NONE || !STYLE_PROMPTS[styleName]) return;

      const keywords = STYLE_PROMPTS[styleName];
      // Micro-deadzone to avoid floating point noise at strict 0, but allow 1% granularity
      if (Math.abs(intensity) < 0.01) return;

      const percentage = (Math.abs(intensity) * 100).toFixed(0);

      if (intensity > 0) {
          // Positive application with granular weight
          styleDirectives.push(`   - Style: "${styleName}" | Influence: ${percentage}% | Visuals: ${keywords}`);
      } else {
          // Negative application (Avoidance) with granular weight
          negativeStyleDirectives.push(`   - Avoid Style: "${styleName}" | Strictness: ${percentage}% | Exclude: ${keywords}`);
      }
  };

  processStyleAxis(styleA, matrixX);
  processStyleAxis(styleB, matrixY);

  if (styleDirectives.length > 0) {
      sections.push(`[STYLE MIXING]
The AI should blend the following styles according to their exact percentage influence (0-100%):
${styleDirectives.join('\n')}`);
  }

  if (negativeStyleDirectives.length > 0) {
       sections.push(`[STYLE EXCLUSIONS]
The AI must actively avoid these specific style elements with the specified strictness (0-100%):
${negativeStyleDirectives.join('\n')}`);
  }

  // 3. ATMOSPHERE & TECHNICAL
  const atmosphere: string[] = [];
  
  if (lighting && LIGHTING_PROMPTS[lighting]) {
      atmosphere.push(`Lighting: ${LIGHTING_PROMPTS[lighting]}`);
  }
  
  if (depthOfField && DEPTH_PROMPTS[depthOfField]) {
      atmosphere.push(`Depth of Field: ${DEPTH_PROMPTS[depthOfField]}`);
  }

  if (colorPalette && COLOR_PALETTE_PROMPTS[colorPalette]) {
      atmosphere.push(`Color Palette: ${COLOR_PALETTE_PROMPTS[colorPalette]}`);
  }

  if (colorCount > 0) {
      atmosphere.push(`Color Limitation: Strictly use exactly ${colorCount} distinct colors (quantized palette)`);
  }
  
  if (atmosphere.length > 0) {
      sections.push(`[ATMOSPHERE & TECHNICAL SPECS]\n${atmosphere.join(' | ')}`);
  }

  // 4. NEGATIVE CONSTRAINTS
  const allNegatives = [...negativePrompts];
  if (allNegatives.length > 0) {
      sections.push(`[GLOBAL NEGATIVE PROMPTS]\n${allNegatives.join(', ')}`);
  }

  // 5. GLOBAL QUALITY SEAL
  sections.push(`[QUALITY STANDARDS]\nHigh fidelity, detailed textures, professional composition, coherent lighting, masterpiece.`);

  return sections.join('\n\n');
};

interface GenerationResult {
    url: string;
    point: Point;
}

export const embedPrompt = async (text: string): Promise<number[]> => {
  try {
    const response = await fetch("/api/embed-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const textResult = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(textResult);
      } catch (e) {
        throw new Error(`Server Error (${response.status}): ${textResult.substring(0, 100)}`);
      }
      throw new Error(errorData.error || "Failed to embed prompt.");
    }

    const result = await response.json();
    
    // Check structure of result.embeddings
    if (result.embeddings && result.embeddings.length > 0) {
      const emb = result.embeddings[0];
      if ((emb as any).values) {
        return (emb as any).values;
      }
      return emb as unknown as number[];
    }
    return [];
  } catch (err) {
    console.error("Failed to embed prompt:", err);
    return [];
  }
};

export const generateImages = async (params: GenerationParams): Promise<GenerationResult[]> => {
  const tasks: { point: Point, index: number }[] = [];

  if (params.matrixPoints.length > 1) {
    params.matrixPoints.forEach((point, index) => {
        tasks.push({ point, index });
    });
  } else {
    const point = params.matrixPoints[0] || { x: 0, y: 0 };
    for (let i = 0; i < params.imageCount; i++) {
        tasks.push({ point, index: i });
    }
  }

  const promises = tasks.map(async (task) => {
    let finalPrompt = constructEnrichedPrompt(params, task.point);
    
    // Ensure uniqueness in the batch by appending a unique variation string
    const seedOffset = params.useCustomSeed ? params.seed + task.index : Math.floor(Math.random() * 100000000);
    finalPrompt += `\n\n[Latent Variation Seed: ${seedOffset}]`;

    const config: any = { 
        imageConfig: {
            aspectRatio: params.aspectRatio
        }
    };
    
    // Pass seed if custom seed is enabled, offset by index for batch uniqueness
    if (params.useCustomSeed) {
        config.seed = params.seed + task.index;
    }
    
    if (params.model === ModelOption.PRO) {
        config.imageConfig.imageSize = "1K";
    }

    const maxRetries = 2;
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch("/api/generate-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ params, finalPrompt, config }),
          });

          if (!response.ok) {
            const textResult = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(textResult);
            } catch (e) {
              throw new Error(`Server Error (${response.status}): ${textResult.substring(0, 100)}`);
            }
            throw new Error(errorData.error || "Failed to generate image.");
          }

          const data = await response.json();

          if (data?.candidates?.[0]?.content?.parts) {
             for (const part of data.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                   return {
                     url: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
                     point: task.point
                   };
                }
             }
          }
          throw new Error("Model returned no image data.");
        } catch (error: any) {
          lastError = error;
          // If it's the last attempt, break and throw
          if (attempt === maxRetries) break;
          // Wait a short delay before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
    
    // Propagate error message to UI
    throw new Error(lastError?.message || "Failed to generate image.");
  });

  // Use allSettled to allow partial success in a batch
  const results = await Promise.allSettled(promises);
  
  const successfulImages: GenerationResult[] = [];
  let errorMsg = "";

  results.forEach(result => {
      if (result.status === 'fulfilled') {
          successfulImages.push(result.value);
      } else {
          errorMsg = result.reason.message;
      }
  });

  if (successfulImages.length === 0 && errorMsg) {
      throw new Error(errorMsg);
  }

  return successfulImages;
};