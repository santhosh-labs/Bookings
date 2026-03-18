
async function test() {
  try {
    const res = await fetch("http://localhost:5000/api/workspaces/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: {
          primaryColor: "#4B4376",
          backgroundUrl: "test-bg.png",
          logoUrl: "test-logo.png",
          headerTitle: "Test Title",
          showHeader: true
        }
      })
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("DATA:", data);
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}
test();
