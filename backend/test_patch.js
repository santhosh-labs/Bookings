async function testPatch() {
  try {
    const res = await fetch("http://localhost:5000/api/workspaces/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: {
          primaryColor: "#4B4376",
          backgroundUrl: "https://example.com/bg.png",
          logoUrl: "https://example.com/logo.png",
          headerTitle: "Test Title",
          showHeader: true
        }
      })
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.error(`Status ${res.status}: ${text}`);
      process.exit(1);
    }
    
    const data = await res.json();
    console.log("Success:", data);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

testPatch();
