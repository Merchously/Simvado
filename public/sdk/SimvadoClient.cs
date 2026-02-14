// SimvadoClient.cs — Drop-in Simvado API client for Unity 2022+
// https://simvado.com/docs/unity
//
// Usage:
//   1. Add this script to your Assets/Scripts folder
//   2. Attach to a GameObject or call as a coroutine helper
//   3. Call CreateSession(), ReportEvent(), CompleteSession()

using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public class SimvadoClient : MonoBehaviour
{
    [Header("Simvado Configuration")]
    [SerializeField] private string baseUrl = "https://simvado.com";
    [SerializeField] private string apiKey = "sk_sim_your_api_key_here";

    public string SessionId { get; private set; }

    /// <summary>Create a new simulation session.</summary>
    public IEnumerator CreateSession(string userId, string moduleId, Action<bool, string> callback = null)
    {
        var body = JsonUtility.ToJson(new CreateSessionRequest
        {
            userId = userId,
            moduleId = moduleId,
            platform = "unity"
        });

        using var request = MakeRequest("/api/game/sessions", "POST", body);
        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success && request.responseCode == 201)
        {
            var response = JsonUtility.FromJson<CreateSessionResponse>(request.downloadHandler.text);
            SessionId = response.sessionId;
            callback?.Invoke(true, SessionId);
        }
        else
        {
            Debug.LogError($"[Simvado] CreateSession failed: {request.error}");
            callback?.Invoke(false, null);
        }
    }

    /// <summary>Report a gameplay event (decision, milestone, score_update, custom).</summary>
    public IEnumerator ReportEvent(string eventType, string eventDataJson, Action<bool> callback = null)
    {
        // Build JSON manually to nest eventData as object
        var body = $"{{\"eventType\":\"{eventType}\",\"eventData\":{eventDataJson}}}";

        using var request = MakeRequest($"/api/game/sessions/{SessionId}/events", "POST", body);
        yield return request.SendWebRequest();

        bool success = request.result == UnityWebRequest.Result.Success && request.responseCode == 201;
        if (!success) Debug.LogError($"[Simvado] ReportEvent failed: {request.error}");
        callback?.Invoke(success);
    }

    /// <summary>Complete the session with final scores. Triggers AI debrief.</summary>
    public IEnumerator CompleteSession(SimvadoScores scores, int totalDurationSeconds, Action<bool> callback = null)
    {
        var body = JsonUtility.ToJson(new CompleteSessionRequest
        {
            finalScores = scores,
            totalDurationSeconds = totalDurationSeconds
        });

        using var request = MakeRequest($"/api/game/sessions/{SessionId}/complete", "POST", body);
        yield return request.SendWebRequest();

        bool success = request.result == UnityWebRequest.Result.Success && request.responseCode == 200;
        if (success)
            Debug.Log("[Simvado] Session completed. AI debrief generated.");
        else
            Debug.LogError($"[Simvado] CompleteSession failed: {request.error}");

        callback?.Invoke(success);
    }

    /// <summary>Helper to report a player decision.</summary>
    public IEnumerator ReportDecision(string choice, string context, Action<bool> callback = null)
    {
        var data = $"{{\"choice\":\"{EscapeJson(choice)}\",\"context\":\"{EscapeJson(context)}\"}}";
        yield return ReportEvent("decision", data, callback);
    }

    /// <summary>Helper to report a milestone.</summary>
    public IEnumerator ReportMilestone(string name, string details = "", Action<bool> callback = null)
    {
        var data = $"{{\"name\":\"{EscapeJson(name)}\",\"details\":\"{EscapeJson(details)}\"}}";
        yield return ReportEvent("milestone", data, callback);
    }

    // --- Private helpers ---

    private UnityWebRequest MakeRequest(string path, string method, string body)
    {
        var request = new UnityWebRequest(baseUrl + path, method);
        request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        request.SetRequestHeader("Authorization", "Bearer " + apiKey);
        return request;
    }

    private static string EscapeJson(string s)
    {
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n");
    }

    // --- Data classes ---

    [Serializable]
    private class CreateSessionRequest
    {
        public string userId;
        public string moduleId;
        public string platform;
    }

    [Serializable]
    private class CreateSessionResponse
    {
        public string sessionId;
    }

    [Serializable]
    private class CompleteSessionRequest
    {
        public SimvadoScores finalScores;
        public int totalDurationSeconds;
    }
}

[Serializable]
public class SimvadoScores
{
    public int financial;
    public int reputational;
    public int ethical;
    public int stakeholder_confidence;
    public int long_term_stability;
    public int total;
}
