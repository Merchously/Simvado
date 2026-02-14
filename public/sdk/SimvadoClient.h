// SimvadoClient.h — Drop-in Simvado API client for Unreal Engine 5
// https://simvado.com/docs/unreal
//
// Usage:
//   1. Add "Http", "Json", "JsonUtilities" to your Build.cs dependencies
//   2. #include "SimvadoClient.h" in your game manager
//   3. Call CreateSession(), ReportEvent(), CompleteSession()

#pragma once

#include "CoreMinimal.h"
#include "HttpModule.h"
#include "Interfaces/IHttpRequest.h"
#include "Interfaces/IHttpResponse.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonWriter.h"
#include "Serialization/JsonSerializer.h"

struct FSimvadoScores
{
    float Financial = 0;
    float Reputational = 0;
    float Ethical = 0;
    float StakeholderConfidence = 0;
    float LongTermStability = 0;
    float Total = 0;
};

class FSimvadoClient
{
public:
    FSimvadoClient(const FString& InBaseUrl, const FString& InApiKey)
        : BaseUrl(InBaseUrl), ApiKey(InApiKey) {}

    // Create a new session. Sets SessionId on success.
    void CreateSession(const FString& UserId, const FString& ModuleId,
        TFunction<void(bool, const FString&)> Callback = nullptr)
    {
        auto Request = FHttpModule::Get().CreateRequest();
        Request->SetURL(BaseUrl + TEXT("/api/game/sessions"));
        Request->SetVerb(TEXT("POST"));
        SetHeaders(Request);

        auto Body = MakeShareable(new FJsonObject);
        Body->SetStringField(TEXT("userId"), UserId);
        Body->SetStringField(TEXT("moduleId"), ModuleId);
        Body->SetStringField(TEXT("platform"), TEXT("unreal"));

        Request->SetContentAsString(SerializeJson(Body));
        Request->OnProcessRequestComplete().BindLambda(
            [this, Callback](FHttpRequestPtr, FHttpResponsePtr Res, bool bOk)
            {
                FString Sid;
                if (bOk && Res.IsValid() && Res->GetResponseCode() == 201)
                {
                    auto Json = ParseJson(Res->GetContentAsString());
                    if (Json.IsValid())
                    {
                        Sid = Json->GetStringField(TEXT("sessionId"));
                        SessionId = Sid;
                    }
                }
                if (Callback) Callback(Sid.Len() > 0, Sid);
            });
        Request->ProcessRequest();
    }

    // Report a gameplay event (decision, milestone, score_update, custom)
    void ReportEvent(const FString& EventType, TSharedPtr<FJsonObject> EventData,
        TFunction<void(bool)> Callback = nullptr)
    {
        auto Request = FHttpModule::Get().CreateRequest();
        Request->SetURL(FString::Printf(TEXT("%s/api/game/sessions/%s/events"),
            *BaseUrl, *SessionId));
        Request->SetVerb(TEXT("POST"));
        SetHeaders(Request);

        auto Body = MakeShareable(new FJsonObject);
        Body->SetStringField(TEXT("eventType"), EventType);
        Body->SetObjectField(TEXT("eventData"), EventData);

        Request->SetContentAsString(SerializeJson(Body));
        Request->OnProcessRequestComplete().BindLambda(
            [Callback](FHttpRequestPtr, FHttpResponsePtr Res, bool bOk)
            {
                if (Callback) Callback(bOk && Res.IsValid() && Res->GetResponseCode() == 201);
            });
        Request->ProcessRequest();
    }

    // Complete the session with final scores. Triggers AI debrief generation.
    void CompleteSession(const FSimvadoScores& Scores, int32 DurationSeconds,
        TFunction<void(bool)> Callback = nullptr)
    {
        auto Request = FHttpModule::Get().CreateRequest();
        Request->SetURL(FString::Printf(TEXT("%s/api/game/sessions/%s/complete"),
            *BaseUrl, *SessionId));
        Request->SetVerb(TEXT("POST"));
        SetHeaders(Request);

        auto ScoresJson = MakeShareable(new FJsonObject);
        ScoresJson->SetNumberField(TEXT("financial"), Scores.Financial);
        ScoresJson->SetNumberField(TEXT("reputational"), Scores.Reputational);
        ScoresJson->SetNumberField(TEXT("ethical"), Scores.Ethical);
        ScoresJson->SetNumberField(TEXT("stakeholder_confidence"), Scores.StakeholderConfidence);
        ScoresJson->SetNumberField(TEXT("long_term_stability"), Scores.LongTermStability);
        ScoresJson->SetNumberField(TEXT("total"), Scores.Total);

        auto Body = MakeShareable(new FJsonObject);
        Body->SetObjectField(TEXT("finalScores"), ScoresJson);
        Body->SetNumberField(TEXT("totalDurationSeconds"), DurationSeconds);

        Request->SetContentAsString(SerializeJson(Body));
        Request->OnProcessRequestComplete().BindLambda(
            [Callback](FHttpRequestPtr, FHttpResponsePtr Res, bool bOk)
            {
                if (Callback) Callback(bOk && Res.IsValid() && Res->GetResponseCode() == 200);
            });
        Request->ProcessRequest();
    }

    FString GetSessionId() const { return SessionId; }

private:
    FString BaseUrl;
    FString ApiKey;
    FString SessionId;

    void SetHeaders(TSharedRef<IHttpRequest> Request)
    {
        Request->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
        Request->SetHeader(TEXT("Authorization"),
            FString::Printf(TEXT("Bearer %s"), *ApiKey));
    }

    static FString SerializeJson(TSharedPtr<FJsonObject> Json)
    {
        FString Out;
        auto Writer = TJsonWriterFactory<>::Create(&Out);
        FJsonSerializer::Serialize(Json.ToSharedRef(), Writer);
        return Out;
    }

    static TSharedPtr<FJsonObject> ParseJson(const FString& Str)
    {
        TSharedPtr<FJsonObject> Out;
        auto Reader = TJsonReaderFactory<>::Create(Str);
        FJsonSerializer::Deserialize(Reader, Out);
        return Out;
    }
};
