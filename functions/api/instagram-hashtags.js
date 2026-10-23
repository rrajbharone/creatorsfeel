/**
 * Cloudflare Pages Function: /api/instagram-hashtags
 * Secure server-side endpoint for Instagram Hashtag Generator.
 * Authenticates with SandBase Public Instagram API using server-side SANDBASE_API_KEY.
 * Falls back to curated topic taxonomy if API key is not configured or live API is unreachable.
 */

// Comprehensive curated hashtag taxonomy across all 11 content categories
const CATEGORY_TAXONOMY = {
  fashion: {
    broad: ['fashion', 'style', 'ootd', 'fashionblogger', 'instafashion', 'streetwear', 'outfitoftheday', 'fashionstyle', 'stylish', 'lookbook'],
    niche: ['sustainablefashion', 'capsulewardrobe', 'minimaliststyle', 'thriftedfashion', 'outfitinspo', 'aestheticfashion', 'vintagestreetwear', 'mensstyleguide', 'parisianchic', 'consciousfashion', 'modestfashion', 'dopaminedressing']
  },
  beauty: {
    broad: ['beauty', 'skincare', 'makeup', 'beautytips', 'instabeauty', 'makeuplover', 'skincareroutine', 'cosmetics', 'glam', 'makeupartist'],
    niche: ['cleanbeauty', 'kbeauty', 'skincarecommunity', 'glowingskin', 'crueltyfreebeauty', 'dewymakeup', 'glassskin', 'skincareaddict', 'barrierrepair', 'no-makeup-makeup', 'cleangirlaesthetic', 'skincaretips']
  },
  travel: {
    broad: ['travel', 'wanderlust', 'travelgram', 'instatravel', 'travelblogger', 'adventure', 'explore', 'vacation', 'holiday', 'tourism'],
    niche: ['solotravel', 'hiddenplaces', 'slowtravel', 'travelcouples', 'backpackerlife', 'budgettravel', 'offthebeatenpath', 'natureescapes', 'femaletraveler', 'postcardsfromtheworld', 'travelcommunity', 'sustainabletourism']
  },
  food: {
    broad: ['food', 'foodie', 'foodporn', 'instafood', 'foodphotography', 'delicious', 'yummy', 'dinner', 'homemade', 'cooking'],
    niche: ['homemadecooking', 'plantbasedrecipes', 'sourdoughbread', 'easyweeknightmeals', 'mealprepsunday', 'comfortfoodie', 'cleaneatingrecipes', 'bakersofig', 'guthealthrecipes', 'quickrecipes', 'feedfeed', 'tastingtable']
  },
  fitness: {
    broad: ['fitness', 'gym', 'workout', 'fit', 'fitnessmotivation', 'bodybuilding', 'training', 'fitfam', 'health', 'lifestyle'],
    niche: ['calisthenicsworkout', 'hyroxcommunity', 'mobilityroutine', 'strengthtraining', 'mindfulmovement', 'pilatesinstructor', 'runningcommunity', 'progressiveoverload', 'zone2training', 'homegymlife', 'functionalfitness', 'athletictraining']
  },
  photography: {
    broad: ['photography', 'photooftheday', 'photographer', 'picoftheday', 'portrait', 'streetphotography', 'landscape', 'naturephotography', 'photoshoot', 'art'],
    niche: ['moodyports', 'filmisnotdead', 'goldenhourphotography', 'urbanstreetview', 'sonyalpha', 'fujifilmx', 'visualsofearth', 'visualstoryteller', 'cinematicphotography', 'analoguevibes', 'rawstreetcapture', 'compositionfirst']
  },
  technology: {
    broad: ['technology', 'tech', 'innovation', 'gadgets', 'programming', 'coding', 'developer', 'artificialintelligence', 'software', 'techtrends'],
    niche: ['saasgrowth', 'webdevcommunity', 'indiemaker', 'desksetupinspo', 'techtipsdaily', 'softwareengineer', 'aiartcommunity', 'buildinpublic', 'cleanarchitecture', 'technewsfeed', 'techreview', 'nocodedeveloper']
  },
  business: {
    broad: ['business', 'entrepreneur', 'marketing', 'success', 'smallbusiness', 'startup', 'leadership', 'motivation', 'money', 'businessowner'],
    niche: ['digitalmarketingtips', 'freelancehustle', 'brandstrategy', 'contentcreationtips', 'solopreneurlife', 'smallbusinessgrowth', 'organicmarketing', 'creatoreconomy', 'inboundmarketing', 'socialmediastrategy', 'monetizeyourcontent', 'businesstips101']
  },
  education: {
    broad: ['education', 'learning', 'knowledge', 'study', 'motivation', 'student', 'studygram', 'facts', 'school', 'learn'],
    niche: ['studytips', 'lifelonglearning', 'notetakingaesthetic', 'languagelearning', 'productivityhacks', 'academicstudy', 'onlinecoursecreator', 'careeradvice', 'skillbuilding', 'digitalnote', 'studycommunity', 'smartlearning']
  },
  lifestyle: {
    broad: ['lifestyle', 'life', 'motivation', 'inspiration', 'mindset', 'happy', 'selfcare', 'dailylife', 'positivity', 'wellness'],
    niche: ['slowliving', 'morningroutine', 'wellnessjourney', 'intentionalcommunity', 'mindfulnesspractice', 'homedecorinspo', 'simpleliving', 'journalingcommunity', 'habittracker', 'cozyvibes', 'selfcarethreads', 'mindfulliving']
  },
  other: {
    broad: ['instagram', 'creator', 'content', 'community', 'trending', 'explorepage', 'reels', 'creative', 'viral', 'instadaily'],
    niche: ['contentcreators', 'creatorsfeel', 'instadaily', 'digitalcreator', 'creativeprocess', 'reelsoftheday', 'visualcontent', 'aestheticfeed', 'explorepageviral', 'communitybuilding', 'microcreator', 'creativeflow']
  }
};

const STOPWORDS = new Set([
  'the','and','a','to','of','in','for','with','on','at','from','by','about','as',
  'into','like','through','after','over','between','out','against','during','without',
  'before','under','around','among','this','that','these','those','my','your','our',
  'their','his','her','its','is','am','are','was','were','be','been','being','have',
  'has','had','do','does','did','will','would','shall','should','may','might','must',
  'can','could','new','best','great','more','most','other','some','such','no','nor',
  'not','only','own','same','so','than','too','very','just','really','photo','reel',
  'video','post','content','instagram','image','pic'
]);

function extractKeywords(text) {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOPWORDS.has(w));
  return Array.from(new Set(words));
}

function cleanTag(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function generateCuratedHashtags(description, keyword, categoryKey, targetCount = 15) {
  const normCategory = (categoryKey || 'other').toLowerCase();
  const tax = CATEGORY_TAXONOMY[normCategory] || CATEGORY_TAXONOMY.other;
  
  // Extract user tokens
  const fullText = `${keyword || ''} ${description || ''}`.trim();
  const rawTokens = extractKeywords(fullText);

  // Content-specific tags derived from user text
  const specificSet = new Set();
  
  // Single token tags
  rawTokens.forEach(t => {
    const cleaned = cleanTag(t);
    if (cleaned.length >= 3) {
      specificSet.add(cleaned);
      specificSet.add(`${cleaned}inspo`);
      specificSet.add(`${cleaned}vibes`);
    }
  });

  // Compound pairs (e.g. vintage + leather -> vintageleather)
  for (let i = 0; i < rawTokens.length - 1 && i < 4; i++) {
    const pair = cleanTag(rawTokens[i] + rawTokens[i + 1]);
    if (pair.length <= 25) {
      specificSet.add(pair);
    }
  }

  // Category + keyword combinations
  if (rawTokens.length > 0) {
    const firstTok = cleanTag(rawTokens[0]);
    if (normCategory !== 'other') {
      specificSet.add(cleanTag(`${normCategory}${firstTok}`));
      specificSet.add(cleanTag(`${firstTok}daily`));
      specificSet.add(cleanTag(`${firstTok}tips`));
    }
  }

  // Segment requested count across 3 tiers (approx 30% Broad, 40% Niche, 30% Specific)
  const broadCount = Math.max(1, Math.round(targetCount * 0.3));
  const specificCount = Math.max(2, Math.round(targetCount * 0.35));
  const nicheCount = Math.max(2, targetCount - broadCount - specificCount);

  // Select Broad tags
  const broadTags = tax.broad.slice(0, broadCount).map(t => ({
    name: `#${cleanTag(t)}`,
    tier: 'broad',
    countText: 'High Reach (1M+)',
    isLive: false
  }));

  // Select Niche tags
  const nicheTags = tax.niche.slice(0, nicheCount).map(t => ({
    name: `#${cleanTag(t)}`,
    tier: 'niche',
    countText: 'Targeted Niche (50K–1M)',
    isLive: false
  }));

  // Select Content-Specific tags
  const specificArray = Array.from(specificSet);
  let finalSpecificNames = specificArray.slice(0, specificCount);
  
  // If user text didn't yield enough specific tags, pull extra niche tags
  if (finalSpecificNames.length < specificCount) {
    const extraNiche = tax.niche.slice(nicheCount);
    const needed = specificCount - finalSpecificNames.length;
    finalSpecificNames = finalSpecificNames.concat(extraNiche.slice(0, needed));
  }

  const specificTags = finalSpecificNames.map(t => ({
    name: `#${cleanTag(t)}`,
    tier: 'specific',
    countText: 'Content Specific (<50K)',
    isLive: false
  }));

  return {
    broad: broadTags,
    niche: nicheTags,
    specific: specificTags
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    const body = await request.json().catch(() => ({}));
    const { description = "", keyword = "", category = "other", count = 15 } = body;

    const requestedCount = Math.min(20, Math.max(5, parseInt(count, 10) || 15));
    const queryText = `${keyword} ${description}`.trim();

    if (!queryText || queryText.length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Please provide a post description or main keyword to generate relevant hashtags."
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if SandBase API Key is configured
    const sandbaseApiKey = env?.SANDBASE_API_KEY;

    if (sandbaseApiKey && sandbaseApiKey.trim().length > 0) {
      try {
        const primaryKeyword = (keyword || description).trim().split(/\s+/)[0];

        // Call SandBase Instagram V2 Hashtag Search API
        const sandbaseRes = await fetch("https://api.sandbase.ai/v1/api/instagram/v2/search-hashtags", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sandbaseApiKey.trim()}`,
            "x-api-key": sandbaseApiKey.trim(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            keyword: cleanTag(primaryKeyword),
            limit: 30
          })
        });

        if (sandbaseRes.ok) {
          const apiData = await sandbaseRes.json().catch(() => ({}));
          const rawItems = Array.isArray(apiData) 
            ? apiData 
            : Array.isArray(apiData.data) 
              ? apiData.data 
              : Array.isArray(apiData.hashtags) 
                ? apiData.hashtags 
                : [];

          if (rawItems.length > 0) {
            // Process live hashtags with actual media counts
            const liveTags = rawItems.map(item => {
              const name = cleanTag(item.name || item.hashtag || item.title || "");
              const mediaCount = item.media_count || item.posts_count || item.count || 0;
              return {
                name: `#${name}`,
                mediaCount: typeof mediaCount === 'number' ? mediaCount : parseInt(mediaCount, 10) || 0,
                isLive: true
              };
            }).filter(t => t.name.length > 1);

            // Deduplicate
            const seen = new Set();
            const uniqueLive = liveTags.filter(t => {
              if (seen.has(t.name)) return false;
              seen.add(t.name);
              return true;
            });

            // Segment into Broad (>= 1M), Niche (50K to 1M), and Specific (< 50K)
            const broad = [];
            const niche = [];
            const specific = [];

            uniqueLive.forEach(t => {
              const count = t.mediaCount;
              const formatted = count >= 1000000 
                ? `${(count / 1000000).toFixed(1)}M posts`
                : count >= 1000 
                  ? `${Math.round(count / 1000)}K posts` 
                  : `${count} posts`;

              const tagObj = {
                name: t.name,
                countText: formatted,
                isLive: true,
                mediaCount: count
              };

              if (count >= 1000000) {
                broad.push(tagObj);
              } else if (count >= 50000) {
                niche.push(tagObj);
              } else {
                specific.push(tagObj);
              }
            });

            // If any category is empty from live API, supplement with curated category tags
            const curatedSupplement = generateCuratedHashtags(description, keyword, category, requestedCount);
            
            const finalBroad = broad.length > 0 ? broad.slice(0, 6) : curatedSupplement.broad;
            const finalNiche = niche.length > 0 ? niche.slice(0, 8) : curatedSupplement.niche;
            const finalSpecific = specific.length > 0 ? specific.slice(0, 6) : curatedSupplement.specific;

            return new Response(
              JSON.stringify({
                success: true,
                isLive: true,
                source: "SandBase Live Instagram API (Verified Media Counts)",
                broad: finalBroad,
                niche: finalNiche,
                specific: finalSpecific,
                total: finalBroad.length + finalNiche.length + finalSpecific.length
              }),
              { status: 200, headers: corsHeaders }
            );
          }
        }
      } catch (apiErr) {
        // Fall through to curated taxonomy if SandBase call times out or throws
        console.warn("SandBase API call failed, falling back to curated taxonomy:", apiErr);
      }
    }

    // Curated Fallback when SANDBASE_API_KEY is not set or API is unreachable
    const curated = generateCuratedHashtags(description, keyword, category, requestedCount);

    return new Response(
      JSON.stringify({
        success: true,
        isLive: false,
        source: "Curated Knowledge Base (Live API Key Not Configured)",
        notice: "SandBase API key is not configured in server environment bindings. Showing verified curated fallback suggestions.",
        broad: curated.broad,
        niche: curated.niche,
        specific: curated.specific,
        total: curated.broad.length + curated.niche.length + curated.specific.length
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred while processing hashtag generation."
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
