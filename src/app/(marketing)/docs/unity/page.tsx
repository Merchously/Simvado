import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unity Integration — Simvado",
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-2 rounded-lg bg-surface-overlay p-4 text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

export default function UnityGuidePage() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/docs"
          className="text-sm text-text-muted hover:text-text-primary transition"
        >
          &larr; Docs
        </Link>
        <h1 className="mt-4 text-4xl font-bold">Unity Integration</h1>
        <p className="mt-2 text-text-secondary">
          Connect your Unity 2022+ simulation to Simvado&apos;s platform.
        </p>

        <div className="mt-12 space-y-12">
          {/* Setup */}
          <div>
            <h2 className="text-2xl font-semibold">1. Setup</h2>
            <p className="mt-2 text-text-secondary">
              Add SimvadoClient.cs to your Unity project&apos;s Assets/Scripts
              folder. Unity&apos;s UnityWebRequest handles all HTTP calls.
            </p>
          </div>

          {/* Config */}
          <div>
            <h2 className="text-2xl font-semibold">2. Configuration</h2>
            <CodeBlock>
              {`using UnityEngine;

public class SimvadoManager : MonoBehaviour
{
    [SerializeField] private string baseUrl = "https://simvado.com";
    [SerializeField] private string apiKey = "sk_sim_your_api_key_here";

    private string sessionId;
    private SimvadoClient client;

    void Start()
    {
        client = new SimvadoClient(baseUrl, apiKey);
    }
}`}
            </CodeBlock>
          </div>

          {/* Create Session */}
          <div>
            <h2 className="text-2xl font-semibold">3. Create Session</h2>
            <CodeBlock>
              {`using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using System.Text;

public IEnumerator CreateSession(string userId, string moduleId)
{
    var body = JsonUtility.ToJson(new SessionRequest {
        userId = userId,
        moduleId = moduleId,
        platform = "unity"
    });

    var request = new UnityWebRequest(baseUrl + "/api/game/sessions", "POST");
    request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
    request.downloadHandler = new DownloadHandlerBuffer();
    request.SetRequestHeader("Content-Type", "application/json");
    request.SetRequestHeader("Authorization", "Bearer " + apiKey);

    yield return request.SendWebRequest();

    if (request.result == UnityWebRequest.Result.Success)
    {
        var response = JsonUtility.FromJson<SessionResponse>(
            request.downloadHandler.text);
        sessionId = response.sessionId;
        Debug.Log("Session created: " + sessionId);
    }
    else
    {
        Debug.LogError("Create session failed: " + request.error);
    }
}

[System.Serializable]
public class SessionRequest
{
    public string userId;
    public string moduleId;
    public string platform;
}

[System.Serializable]
public class SessionResponse
{
    public string sessionId;
}`}
            </CodeBlock>
          </div>

          {/* Report Event */}
          <div>
            <h2 className="text-2xl font-semibold">4. Report Events</h2>
            <CodeBlock>
              {`public IEnumerator ReportDecision(string choice, string context)
{
    var eventData = new EventPayload {
        eventType = "decision",
        eventData = JsonUtility.ToJson(new DecisionData {
            choice = choice,
            context = context
        })
    };

    var body = JsonUtility.ToJson(eventData);
    var url = baseUrl + "/api/game/sessions/" + sessionId + "/events";

    var request = new UnityWebRequest(url, "POST");
    request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
    request.downloadHandler = new DownloadHandlerBuffer();
    request.SetRequestHeader("Content-Type", "application/json");
    request.SetRequestHeader("Authorization", "Bearer " + apiKey);

    yield return request.SendWebRequest();

    if (request.result != UnityWebRequest.Result.Success)
    {
        Debug.LogError("Report event failed: " + request.error);
    }
}

[System.Serializable]
public class EventPayload { public string eventType; public string eventData; }

[System.Serializable]
public class DecisionData { public string choice; public string context; }`}
            </CodeBlock>
          </div>

          {/* Complete */}
          <div>
            <h2 className="text-2xl font-semibold">5. Complete Session</h2>
            <CodeBlock>
              {`public IEnumerator CompleteSession(FinalScores scores, int durationSeconds)
{
    var body = JsonUtility.ToJson(new CompletionRequest {
        finalScores = scores,
        totalDurationSeconds = durationSeconds
    });

    var url = baseUrl + "/api/game/sessions/" + sessionId + "/complete";

    var request = new UnityWebRequest(url, "POST");
    request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
    request.downloadHandler = new DownloadHandlerBuffer();
    request.SetRequestHeader("Content-Type", "application/json");
    request.SetRequestHeader("Authorization", "Bearer " + apiKey);

    yield return request.SendWebRequest();

    if (request.result == UnityWebRequest.Result.Success)
    {
        Debug.Log("Session completed. AI debrief generated.");
    }
}

[System.Serializable]
public class FinalScores
{
    public int financial;
    public int reputational;
    public int ethical;
    public int stakeholder_confidence;
    public int long_term_stability;
    public int total;
}

[System.Serializable]
public class CompletionRequest
{
    public FinalScores finalScores;
    public int totalDurationSeconds;
}`}
            </CodeBlock>
          </div>

          {/* Download */}
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
            <h2 className="text-lg font-semibold mb-2">
              Download Full SDK Script
            </h2>
            <p className="text-sm text-text-muted mb-4">
              Drop-in MonoBehaviour with all methods ready to use.
            </p>
            <a
              href="/sdk/SimvadoClient.cs"
              download
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition"
            >
              Download SimvadoClient.cs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
