import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const qaEntries = [
{"content": "Q: Is Alakazam known for its high Special Attack?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Alakazam"},
{"content": "Q: Is Geodude part Water-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.1, "concept": "Geodude"},
{"content": "Q: Is Vulpix originally a Fire-type Pokémon?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Vulpix"},
{"content": "Q: Is Ninetales capable of having more than one tail?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Ninetales"},
{"content": "Q: Is Growlithe part Electric-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Growlithe"},
{"content": "Q: Is Arcanine referred to as the Legendary Pokémon?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Arcanine"},
{"content": "Q: Is Poliwag part Water-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.1, "concept": "Poliwag"},
{"content": "Q: Is Poliwrath a dual Water and Fighting type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Poliwrath"},
{"content": "Q: Is Abra known for being hard to catch due to Teleport?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Abra"},
{"content": "Q: Is Kadabra banned from appearing in the TCG for many years?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.6, "concept": "Kadabra"},
{"content": "Q: Is Bellsprout part Poison-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Bellsprout"},
{"content": "Q: Is Weepinbell able to evolve with a Sun Stone?\nA: No", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Weepinbell"},
{"content": "Q: Is Victreebel a fully evolved Pokémon?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Victreebel"},
{"content": "Q: Is Tentacool part Poison-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Tentacool"},
{"content": "Q: Is Tentacruel known for having many tentacles?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Tentacruel"},
{"content": "Q: Is Ponyta part Fire-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.15, "concept": "Ponyta"},
{"content": "Q: Is Rapidash known for high speed stats?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Rapidash"},
{"content": "Q: Is Slowpoke part Psychic-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.15, "concept": "Slowpoke"},
{"content": "Q: Is Slowbro created when a Shellder bites Slowpoke's tail?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Slowbro"},
{"content": "Q: Is Magnemite part Steel-type in Gen I?\nA: No", "source_type": "qa_import", "complexity_score": 0.5, "concept": "Magnemite"},
{"content": "Q: Is Magneton formed by three Magnemite?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Magneton"},
{"content": "Q: Is Farfetch'd known for carrying a leek stalk?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Farfetch'd"},
{"content": "Q: Is Doduo able to fly?\nA: No", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Doduo"},
{"content": "Q: Is Dodrio known for having three heads?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Dodrio"},
{"content": "Q: Is Dewgong part Ice-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Dewgong"},
{"content": "Q: Is Grimer originally from the Johto region?\nA: No", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Grimer"},
{"content": "Q: Is Muk known for living in polluted areas?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Muk"},
{"content": "Q: Is Shellder known to clamp onto Slowpoke?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Shellder"},
{"content": "Q: Is Cloyster part Dark-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Cloyster"},
{"content": "Q: Is Gastly part Poison-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Gastly"},
{"content": "Q: Is Haunter able to evolve by leveling up?\nA: No", "source_type": "qa_import", "complexity_score": 0.45, "concept": "Haunter"},
{"content": "Q: Is Onix a Rock/Ground-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Onix"},
{"content": "Q: Is Drowzee inspired by the tapir?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Drowzee"},
{"content": "Q: Is Hypno known for hypnotizing children?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.55, "concept": "Hypno"},
{"content": "Q: Is Krabby part Water-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Krabby"},
{"content": "Q: Is Kingler known for its massive pincer?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Kingler"},
{"content": "Q: Is Voltorb known for exploding easily?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Voltorb"},
{"content": "Q: Is Electrode slower than Voltorb?\nA: No", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Electrode"},
{"content": "Q: Is Exeggcute considered a group of eggs?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Exeggcute"},
{"content": "Q: Is Exeggutor part Psychic-type in Gen I?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Exeggutor"},
{"content": "Q: Is Cubone known for wearing its mother's skull?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.6, "concept": "Cubone"},
{"content": "Q: Is Marowak the evolved form of Cubone?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Marowak"},
{"content": "Q: Is Hitmonlee inspired by kicking techniques?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Hitmonlee"},
{"content": "Q: Is Hitmonchan named after Jackie Chan?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.45, "concept": "Hitmonchan"},
{"content": "Q: Is Lickitung part Dragon-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Lickitung"},
{"content": "Q: Is Koffing known for floating by filling itself with gas?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Koffing"},
{"content": "Q: Is Weezing formed by two Koffing?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Weezing"},
{"content": "Q: Is Rhyhorn part Rock-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Rhyhorn"},
{"content": "Q: Is Rhydon the first Pokémon ever designed?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.55, "concept": "Rhydon"},
{"content": "Q: Is Chansey known for being rare and high-HP?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.5, "concept": "Chansey"},
{"content": "Q: Is Tangela part Grass-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Tangela"},
{"content": "Q: Is Kangaskhan known for carrying a baby in its pouch?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Kangaskhan"},
{"content": "Q: Is Horsea part Psychic-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.15, "concept": "Horsea"},
{"content": "Q: Is Seadra the evolution of Horsea?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.15, "concept": "Seadra"},
{"content": "Q: Is Goldeen known for the move Horn Attack?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Goldeen"},
{"content": "Q: Is Seaking known for high Attack stats?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Seaking"},
{"content": "Q: Is Staryu part Psychic-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Staryu"},
{"content": "Q: Is Starmie part Psychic-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Starmie"},
{"content": "Q: Is Mr. Mime partially Fairy-type in Gen VI onward?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.5, "concept": "Mr. Mime"},
{"content": "Q: Is Scyther part Flying-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Scyther"},
{"content": "Q: Is Jynx part Ice-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Jynx"},
{"content": "Q: Is Electabuzz part Fighting-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Electabuzz"},
{"content": "Q: Is Magmar known for its fiery body temperature?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Magmar"},
{"content": "Q: Is Pinsir part Bug-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Pinsir"},
{"content": "Q: Is Tauros known for having three tails?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Tauros"},
{"content": "Q: Is Gyarados originally a Magikarp?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.15, "concept": "Gyarados"},
{"content": "Q: Is Lapras capable of ferrying people across water?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Lapras"},
{"content": "Q: Is Vaporeon an evolution of Eevee?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.15, "concept": "Vaporeon"},
{"content": "Q: Is Jolteon known for its high Speed stat?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Jolteon"},
{"content": "Q: Is Porygon able to change its form via upgrades?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.45, "concept": "Porygon"},
{"content": "Q: Is Omanyte revived from a Helix Fossil?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Omanyte"},
{"content": "Q: Is Omastar the evolved form of Omanyte?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Omastar"},
{"content": "Q: Is Kabuto revived from a Dome Fossil?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Kabuto"},
{"content": "Q: Is Kabutops part Rock-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Kabutops"},
{"content": "Q: Is Aerodactyl revived from an Old Amber fossil?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Aerodactyl"},
{"content": "Q: Is Snorlax part Fighting-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Snorlax"},
{"content": "Q: Is Articuno an Ice/Flying-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Articuno"},
{"content": "Q: Is Zapdos part Electric/Flying-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Zapdos"},
{"content": "Q: Is Moltres part Fire/Flying-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Moltres"},
{"content": "Q: Is Dratini part Dragon-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Dratini"},
{"content": "Q: Is Dragonair known for having wings?\nA: No", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Dragonair"},
{"content": "Q: Is Dragonite a Dragon/Flying-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Dragonite"},
{"content": "Q: Is Chikorita one of the Johto starters?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Chikorita"},
{"content": "Q: Is Bayleef the evolution of Chikorita?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Bayleef"},
{"content": "Q: Is Meganium part Poison-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Meganium"},
{"content": "Q: Is Cyndaquil a Fire-type starter?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.15, "concept": "Cyndaquil"},
{"content": "Q: Is Quilava known for having fiery back flames?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Quilava"},
{"content": "Q: Is Typhlosion part Fire/Fighting-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.45, "concept": "Typhlosion"},
{"content": "Q: Is Totodile originally a Water-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.15, "concept": "Totodile"},
{"content": "Q: Is Croconaw the evolved form of Totodile?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Croconaw"},
{"content": "Q: Is Feraligatr known for high Speed stats?\nA: No", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Feraligatr"},
{"content": "Q: Is Sentret known for standing on its tail?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Sentret"},
{"content": "Q: Is Furret extremely tall for its width?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.5, "concept": "Furret"},
{"content": "Q: Is Ledyba part Bug/Flying-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Ledyba"},
{"content": "Q: Is Ledian known for multiple arms?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Ledian"},
{"content": "Q: Is Spinarak part Bug/Poison-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Spinarak"},
{"content": "Q: Is Ariados known for using string to trap prey?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Ariados"},
{"content": "Q: Is Crobat the evolution of Golbat?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Crobat"},
{"content": "Q: Is Pichu the pre-evolution of Pikachu?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Pichu"},
{"content": "Q: Is Cleffa part Fairy-type in later generations?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Cleffa"},
{"content": "Q: Is Igglybuff the pre-evolution of Jigglypuff?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Igglybuff"},
{"content": "Q: Is Togepi known for being carried by Misty in the anime?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Togepi"},
{"content": "Q: Is Togetic the evolution of Togepi?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Togetic"},
{"content": "Q: Is Natu part Psychic/Flying-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Natu"},
{"content": "Q: Is Xatu known for standing still all day?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.45, "concept": "Xatu"},
{"content": "Q: Is Mareep part Electric-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.15, "concept": "Mareep"},
{"content": "Q: Is Flaaffy pink in color?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Flaaffy"},
{"content": "Q: Is Ampharos part Electric/Dragon-type in Gen II?\nA: No", "source_type": "qa_import", "complexity_score": 0.45, "concept": "Ampharos"},
{"content": "Q: Is Marill originally Water-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Marill"},
{"content": "Q: Is Azumarill part Fairy-type in later generations?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Azumarill"},
{"content": "Q: Is Sudowoodo a Rock-type despite looking like a tree?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.5, "concept": "Sudowoodo"},
{"content": "Q: Is Hoppip part Grass/Flying-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Hoppip"},
{"content": "Q: Is Skiploom the middle evolution of Hoppip?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Skiploom"},
{"content": "Q: Is Jumpluff known for traveling far on the wind?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Jumpluff"},
{"content": "Q: Is Aipom known for having a hand on its tail?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Aipom"},
{"content": "Q: Is Sunkern known for having the lowest base stat total?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.6, "concept": "Sunkern"},
{"content": "Q: Is Sunflora evolved using a Sun Stone?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Sunflora"},
{"content": "Q: Is Yanma capable of seeing 360 degrees around itself?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Yanma"},
{"content": "Q: Is Wooper part Water/Ground-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.25, "concept": "Wooper"},
{"content": "Q: Is Quagsire known for its carefree attitude?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Quagsire"},
{"content": "Q: Is Espeon an evolution of Eevee tied to friendship and daytime?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Espeon"},
{"content": "Q: Is Umbreon evolved through nighttime friendship?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Umbreon"},
{"content": "Q: Is Murkrow part Dark/Flying-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.35, "concept": "Murkrow"},
{"content": "Q: Is Slowking formed when a Shellder clamps onto Slowpoke's head?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.5, "concept": "Slowking"},
{"content": "Q: Is Misdreavus part Ghost-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Misdreavus"},
{"content": "Q: Is Unown capable of taking on 28 different forms?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.55, "concept": "Unown"},
{"content": "Q: Is Wobbuffet known for counterattacking instead of attacking first?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.45, "concept": "Wobbuffet"},
{"content": "Q: Is Girafarig a Normal/Psychic-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Girafarig"}
];

const DOMAIN_ID = '#AE0002';
const INITIAL_CHARACTER_ID = '#700007';

async function importQA() {
  console.log(`Starting import of ${qaEntries.length} Q&A entries...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const entry of qaEntries) {
    try {
      const knowledgeId = await generateHexId('knowledge_item_id');
      
      await pool.query(
        `INSERT INTO knowledge_items (knowledge_id, content, domain_id, source_type, initial_character_id, complexity_score, concept)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [knowledgeId, entry.content, DOMAIN_ID, entry.source_type, INITIAL_CHARACTER_ID, entry.complexity_score, entry.concept]
      );
      
      console.log(`Inserted ${knowledgeId}: ${entry.concept}`);
      successCount++;
    } catch (error) {
      console.error(`Failed to insert ${entry.concept}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\nImport complete: ${successCount} success, ${errorCount} errors`);
  await pool.end();
}

importQA();
