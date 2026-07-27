# Generative UI, The General Version

A learning guide that isn't tied to any one product. The goal here is to understand the pattern well enough to use it in any app you build, and to understand why the cheap version of it is usually the right version.

## What generative UI actually means

The phrase sounds like "the model draws the screen," and that's the version most demos show you. It's also the most expensive and least controllable version, so it's a bad place to start. Here's the definition that will serve you better: generative UI is when the model chooses the structure of the interface at runtime, instead of you hardcoding which screen appears when. That's it. The model is making a decision that used to be baked into your frontend. Whether it makes that decision by inventing raw HTML or by picking one of your own components off a shelf is an implementation choice, and those choices sit on a spectrum.

Understanding the spectrum is the whole lesson, because once you see it you'll stop asking "how do I do generative UI" and start asking "how much of the UI decision do I want to hand to the model, and what am I willing to pay for it."

## The spectrum, from cheap and controlled to expensive and open

At one end you have controlled generative UI. You build your own React components once, the way you'd build any component. You describe each one to the model, either as a tool it can call or as an entry in a small catalog. The model's only job is to pick a component and supply its props. So the model emits something tiny, on the order of `{"type": "CollegeCard", "props": {"name": "GCOE Amravati", "code": 4004}}`, and your frontend renders your real, branded, tested component. You keep full control of how things look, the output is small, and you can unit-test the components like anything else. The cost is that the model can only use components you've already built, so your catalog grows as your needs grow.

In the middle you have a declarative catalog. Same idea, but instead of one component per response the model composes several from a fixed vocabulary using a small schema, so one interface can hold a heading, a table, and a form together. You give up a little consistency (the same prompt can produce slightly different layouts run to run) in exchange for not having to pre-build every combination. Google's A2UI and the various json-render libraries are current examples of this shape.

At the far end you have open-ended generation. The model invents the entire interface every turn and streams back a big blob, either a domain-specific language or raw HTML, which a generic renderer turns into widgets. This is the most flexible option and the one commercial products like Thesys sell, because it handles interactions you never anticipated. It's also the most expensive and the least predictable. The model is writing a full UI description as output on every message, brand consistency depends on prompting rather than on your code, and you can't really unit-test what the model might invent.

None of these is the "right" one in the abstract. The point is to match the position on the spectrum to the job. Recurring, branded flows want the controlled end. Genuine long-tail, unpredictable interactions are the only real case for the open end.

## Why the cheap end is usually right, and why cost is the deciding factor

Here's the part worth internalizing. Output tokens cost several times more than input tokens across essentially every model, and the open end of the spectrum turns your entire UI into output tokens on every single turn. A college card that could have been forty tokens of JSON becomes a few hundred tokens of markup, and you pay that premium on every message for the life of the app. Multiply by real traffic and the difference stops being academic.

So the economics push the same direction the engineering does. The controlled approach is cheaper to run, faster to render, easier to keep on-brand, and testable, and it costs you only the flexibility to render things you didn't plan for. For most real apps that's a trade you happily make, and you buy back flexibility only where a specific feature needs it by adding to your catalog. A good instinct: start controlled, and move toward the open end only when you hit a wall you can name.

## The four transferable skills

Strip away the frameworks and product names and generative UI is really four skills, all of which apply to any app:

1. Designing a compact schema or tool interface that a model can reliably hit. Small, unambiguous, and hard to get wrong.
2. Building a component registry that maps the model's choice to a real rendered component, with a sensible fallback for anything unrecognized.
3. Streaming and rendering partial structured output without the layout thrashing while it arrives.
4. Validating the model's output so a malformed or hallucinated component degrades gracefully instead of crashing the page.

Notice that only the model call itself touches anything AI-specific. The registry, the validation, and the rendering are ordinary frontend engineering, which is why this pattern travels so well.

## The mechanics, in plain code

The contract between model and frontend is just a small JSON shape you define. Something like this is plenty to start:

```json
{
  "components": [
    { "type": "Callout", "props": { "tone": "info", "text": "Based on a 92 percentile in Computer Science, here are strong matches." } },
    { "type": "CollegeCard", "props": { "name": "Government College of Engineering, Amravati", "code": 4004, "chance": "High" } },
    { "type": "CutoffTable", "props": { "rows": [ { "year": 2025, "round": 1, "cutoff": 89.4 } ] } }
  ]
}
```

Your frontend keeps a registry, which is nothing more than a lookup from a type string to a component:

```jsx
const REGISTRY = {
  Callout,
  CollegeCard,
  CutoffTable,
  InfoForm,
};

function RenderSpec({ spec }) {
  return spec.components.map((node, i) => {
    const Component = REGISTRY[node.type];
    if (!Component) return <UnknownComponent key={i} type={node.type} />; // graceful fallback
    return <Component key={i} {...node.props} />;
  });
}
```

Getting the model to produce that JSON is a normal chat completion against any provider. You describe the available components in the system prompt and ask for JSON only. This is deliberately vendor-neutral; it works against any OpenAI-compatible endpoint, and the same idea works with Anthropic's API or a local model:

```python
SYSTEM = """You build UI specs for a college finder.
Return ONLY JSON of the form {"components": [ ... ]}.
Available components:
- Callout(props: tone in [info, warn, success], text)
- CollegeCard(props: name, code, chance in [High, Medium, Borderline])
- CutoffTable(props: rows[] of {year, round, cutoff})
- InfoForm(props: fields[] of {name, label, kind})
Choose the components that best answer the user. Do not include prose outside the JSON."""

resp = client.chat.completions.create(
    model="<any-capable-model>",
    response_format={"type": "json_object"},
    messages=[{"role": "system", "content": SYSTEM},
              {"role": "user", "content": user_message}],
)
spec = json.loads(resp.choices[0].message.content)
```

That's the entire pattern. The model picks structure, your code owns appearance, and the thing crossing the wire is small. Everything else, streaming, validation, richer components, is refinement on top of this core.

## The exercise I'd actually assign

Rebuild the SGBAU college-finder interaction at the controlled end of the spectrum, and measure the difference. Concretely: build four of your own components (a college card, a cutoff table, a branch-and-percentile form, and a callout), wire up a registry and a validating renderer, and have a model emit the compact JSON that selects among them. Then compare the output-token count of your JSON specs against the equivalent full-markup approach for the same screens, so the cost lesson arrives as real numbers rather than a claim. Add a fallback component and deliberately feed the renderer a bad spec to watch it degrade instead of crash.

If you want a framework to lean on, the Vercel AI SDK and assistant-ui both give you this shape with little boilerplate. For a first pass I'd do it by hand with plain JSON, because the point of the exercise is to understand the mechanics rather than to learn a library's API. Once you've built it once by hand, every framework in this space will make immediate sense, and you'll be able to judge which one is worth adopting instead of guessing.

## The one-line summary to remember

Generative UI is the model choosing structure, not the model drawing pixels. Keep the appearance in your code, keep the model's output small, and move toward model-generated markup only when a real feature forces you to.
