# Thesys GenUI Full-Stack Integration Master Guide
A comprehensive, production-ready, step-by-step developer guide to configure **Thesys Generative UI (GenUI)** across your React/Vite frontend and Python/FastAPI backend.

---

## 1. Executive Concept & Theoretical Overview

### What is Generative UI (GenUI)?
Traditional chatbots deliver static plain-text or markdown lists. Generative UI (GenUI) is a state-of-the-art interface design where the language model dynamically creates **interactive, functional components** (such as search forms, charts, selectors, and checkboxes) in real-time.

Instead of writing custom layout handlers for every possible scenario, the AI dictates the UI components, values, and options it needs. The client-side renders these components inside sandbox layers natively.

### Thesys C1 DSL Mechanism
1. **The LLM Output:** The LLM returns a response that includes standard speech text followed by a custom XML-based domain-specific language (C1 DSL) wrapped in `<content>` tags.
2. **Local Client Interception:** The frontend listens to the token stream. If it detects the `<content>` tags, it avoids standard paragraph wrappers and passes the XML block directly to the `<C1Component>` parser.
3. **Widget Generation:** The `<C1Component>` maps the XML structure (e.g., `<input type="text" />`, `<button />`) to actual interactive React components styled by the Crayon UI framework library.

---

## 2. Comprehensive Frontend Integration (React/Vite)

### Step 2.1: Project Setup & Package Installation
Open your terminal in the root directory of your Vite/React frontend and run the following command to download the core SDK and styling assets:

```bash
npm install @thesysai/genui-sdk @crayonai/react-ui
```

* **`@thesysai/genui-sdk`**: Handles XML parser tokens, lifecycle loops, and context rendering.
* **`@crayonai/react-ui`**: Delivers the CSS components, layouts, forms, buttons, and visual tokens.

### Step 2.2: Global Style Precedence Setup
In React, styles are compiled sequentially. If your custom styles are imported before external library styles, the library styles can overwrite your customizations. You MUST import the `@crayonai` stylesheet *before* your project stylesheet:

```javascript
// src/main.jsx or src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. External UI library style definitions (Primary)
import "@crayonai/react-ui/styles/index.css";

// 2. Local style customizations (Allows overriding Crayon UI tokens)
import "./index.css";
```

### Step 2.3: Context Root Configuration (`ThemeProvider`)
The SDK elements use context states to propagate theme settings (such as dark/light modes) and style constants. Wrap the parent layout inside `<ThemeProvider>` in your root file:

```javascript
// src/main.jsx
import { ThemeProvider } from "@thesysai/genui-sdk";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider mode="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

### Step 2.4: Implementing the Parser Helper (`isThesysContent`)
To prevent plain text sentences from being loaded inside dashboard card wrappers, write a utility helper checking for the XML block prefix:

```javascript
// src/components/Chat.jsx
const isThesysContent = (content) => {
  return typeof content === 'string' && content.includes('<content');
};
```

### Step 2.5: Conditional Message Router
Update your chat messages loop to dynamically switch between standard speech bubbles and generative component boards:

```jsx
// src/components/Chat.jsx
<div className="chat-container">
  {messages.map((m, idx) => (
    <div key={m.id || idx} className={`msg-row ${m.sender}`}>
      {m.sender === 'user' ? (
        <div className="chat-bubble-user">{m.content}</div>
      ) : isThesysContent(m.content) ? (
        <div className="genui-card-wrapper" style={{ width: '100%' }}>
          <C1Component 
            c1Response={m.content} 
            isStreaming={false} 
            onAction={handleC1Action} 
            searchImage={handleSearchImage} 
          />
        </div>
      ) : (
        <div className="chat-bubble-assistant">{m.content}</div>
      )}
    </div>
  ))}
</div>
```

### Step 2.6: Interactive Action Callback (`onAction`)
Form submissions or button clicks generated inside the UI need to send payloads back to the AI engine to generate follow-up responses:

```javascript
// src/components/Chat.jsx
const handleC1Action = (action) => {
  // Capture payload message designed for the AI
  const userMsg = action.llmFriendlyMessage || action.humanFriendlyMessage;
  if (userMsg) {
    sendChatMessage(userMsg); // Your message dispatch function
  }
};
```

### Step 2.7: Absolute URL Image Resolvers (`searchImage`)
Because components are processed inside sandboxed iframe containers, **relative paths (e.g. `/src/assets/logo.png`) will fail to render**. You must map queries and return absolute URLs:

```javascript
// src/components/Chat.jsx
const handleSearchImage = async (query) => {
  const q = (query || "").toLowerCase();
  
  // 1. Direct Web URLs for specific college queries
  if (q.includes("ssgmce") || q.includes("gajanan maharaj")) {
    return {
      url: "https://images.shiksha.com/mediadata/images/1579244304phpWkQJ9r.jpeg",
      thumbnailUrl: "https://images.shiksha.com/mediadata/images/1579244304phpWkQJ9r.jpeg"
    };
  }
  
  // 2. Prepend window.location.origin to local assets to make them absolute
  let localAssetPath = "/src/assets/sgbau_entrance.png";
  const absoluteUrl = `${window.location.origin}${localAssetPath}`;
  return {
    url: absoluteUrl,
    thumbnailUrl: absoluteUrl
  };
};
```

### Step 2.8: Delayed Autoscroll Handling
Dynamic templates shift layouts as elements render. Implement delayed scroll triggers to ensure viewport stays locked to the bottom:

```javascript
// src/components/Chat.jsx
const chatContainerRef = useRef(null);

useEffect(() => {
  if (messages.length === 0 && !streamingText) return;
  const container = chatContainerRef.current;
  if (!container) return;

  // Immediate scroll
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });

  // Stage 1: Scroll after C1 structural container paints
  const t1 = setTimeout(() => {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, 150);

  // Stage 2: Scroll after inner images and assets settle
  const t2 = setTimeout(() => {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, 450);

  return () => {
    clearTimeout(t1);
    clearTimeout(t2);
  };
}, [messages, streamingText, loading]);
```

---

## 3. Comprehensive Backend Integration (Python/FastAPI)

### Step 3.1: Config Schema Variables
Manage configuration parameters securely inside Pydantic structures:

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    THESYS_API_KEY: str
    THESYS_BASE_URL: str = "https://api.thesys.ai/v1"
    THESYS_MODEL: str = "thesys-model-v1"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Step 3.2: OpenAI Client Initialization
Initialize the AsyncOpenAI client pointing to the Thesys endpoints:

```python
# app/services/chatbot.py
from openai import AsyncOpenAI
from app.config import settings

client = AsyncOpenAI(
    api_key=settings.THESYS_API_KEY,
    base_url=settings.THESYS_BASE_URL
)
```

### Step 3.3: Async completion streaming wrapper
Set up the method that sends contextual database facts and formatting directives as system prompts alongside chat histories:

```python
# app/services/chatbot.py
async def get_thesys_chat_response(messages: list, db_facts: str):
    enriched_messages = [
        {"role": "system", "content": SYSTEM_PROMPT + "\n\n--- FACTS DATABASE ---\n" + db_facts}
    ]
    for msg in messages:
        enriched_messages.append({"role": msg["role"], "content": msg["content"]})
        
    response = await client.chat.completions.create(
        model=settings.THESYS_MODEL,
        messages=enriched_messages,
        stream=True
    )
    return response
```

### Step 3.4: FastAPI Router & StreamingResponse setup
Configure the HTTP endpoints. Stream chunks returned from the generator back to the frontend with event-stream media types:

```python
# app/routers/chat.py
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.services.chatbot import get_thesys_chat_response

router = APIRouter(prefix="/chats", tags=["Chat"])

@router.post("/{session_id}/send")
async def send_chat_message(session_id: str, content: str):
    # 1. Fetch relevant database entries
    db_facts = "Colleges Info: Government College of Engg, Amravati..."
    
    # 2. Get past messages history
    history = [{"role": "user", "content": content}]
    
    # 3. Stream Generator Function
    async def chat_response_generator():
        response_stream = await get_thesys_chat_response(history, db_facts)
        async for chunk in response_stream:
            token = chunk.choices[0].delta.content
            if token:
                yield token
                
    return StreamingResponse(chat_response_generator(), media_type="text/plain")
```

### Step 3.5: Generative UI System Prompt Schema
Instruct the LLM on exactly how to write valid C1 XML schema layout tags inside the system instruction prompt:

```python
SYSTEM_PROMPT = """
You are an AI advisor. When structured options are required, respond using XML-based widgets:

Form Syntax:
<content type="form" title="College Finder">
  <input type="select" name="branch" label="Select Engineering Branch" required="true">
    <option value="CS" label="Computer Science" />
    <option value="IT" label="Information Technology" />
  </input>
  <input type="text" name="cutoff" label="MHT-CET Percentile" required="true" />
  <button action="submit" label="Find Eligible Colleges" />
</content>

Button Link Syntax:
<content type="buttons">
  <button action="open_url" url="https://sgbau.ac.in" label="Visit Official Website" />
</content>
"""
```

---

## 4. Custom Branding Styling Overrides
To change default black button styling to Emerald Green matching the template, add the overrides at the root of `index.css`:

```css
/* src/index.css */
:root {
  --crayon-interactive-accent: #047857 !important;         /* Accent color (buttons, checkbox) */
  --crayon-interactive-accent-hover: #065f46 !important;   /* Button hover state */
  --crayon-interactive-accent-pressed: #044e39 !important; /* Button active click state */
  --crayon-stroke-accent: #047857 !important;              /* Borders */
  --crayon-accent-primary-text: #ffffff !important;        /* Text inside buttons */
}
```
