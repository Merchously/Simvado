import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unreal Engine Integration — Simvado",
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-2 rounded-lg bg-surface-overlay p-4 text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

export default function UnrealGuidePage() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/docs"
          className="text-sm text-text-muted hover:text-text-primary transition"
        >
          &larr; Docs
        </Link>
        <h1 className="mt-4 text-4xl font-bold">Unreal Engine Integration</h1>
        <p className="mt-2 text-text-secondary">
          Connect your Unreal Engine 5 simulation to Simvado&apos;s platform.
        </p>

        <div className="mt-12 space-y-12">
          {/* Setup */}
          <div>
            <h2 className="text-2xl font-semibold">1. Setup</h2>
            <p className="mt-2 text-text-secondary">
              Include the HTTP module in your Build.cs:
            </p>
            <CodeBlock>
              {`// YourProject.Build.cs
PublicDependencyModuleNames.AddRange(new string[] {
    "Core", "CoreUObject", "Engine", "Http", "Json", "JsonUtilities"
});`}
            </CodeBlock>
          </div>

          {/* Config */}
          <div>
            <h2 className="text-2xl font-semibold">2. Configuration</h2>
            <p className="mt-2 text-text-secondary">
              Store your API key and base URL:
            </p>
            <CodeBlock>
              {`// SimvadoConfig.h
#pragma once

namespace SimvadoConfig
{
    const FString BaseUrl = TEXT("https://simvado.com");
    const FString ApiKey  = TEXT("sk_sim_your_api_key_here");
}`}
            </CodeBlock>
          </div>

          {/* Create Session */}
          <div>
            <h2 className="text-2xl font-semibold">3. Create Session</h2>
            <CodeBlock>
              {`void ASimvadoManager::CreateSession(const FString& UserId, const FString& ModuleId)
{
    auto Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(SimvadoConfig::BaseUrl + TEXT("/api/game/sessions"));
    Request->SetVerb(TEXT("POST"));
    Request->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
    Request->SetHeader(TEXT("Authorization"),
        FString::Printf(TEXT("Bearer %s"), *SimvadoConfig::ApiKey));

    TSharedPtr<FJsonObject> Body = MakeShareable(new FJsonObject);
    Body->SetStringField(TEXT("userId"), UserId);
    Body->SetStringField(TEXT("moduleId"), ModuleId);
    Body->SetStringField(TEXT("platform"), TEXT("unreal"));

    FString BodyString;
    auto Writer = TJsonWriterFactory<>::Create(&BodyString);
    FJsonSerializer::Serialize(Body.ToSharedRef(), Writer);
    Request->SetContentAsString(BodyString);

    Request->OnProcessRequestComplete().BindLambda(
        [this](FHttpRequestPtr Req, FHttpResponsePtr Res, bool bSuccess)
        {
            if (bSuccess && Res->GetResponseCode() == 201)
            {
                TSharedPtr<FJsonObject> Json;
                auto Reader = TJsonReaderFactory<>::Create(Res->GetContentAsString());
                FJsonSerializer::Deserialize(Reader, Json);
                SessionId = Json->GetStringField(TEXT("sessionId"));
                UE_LOG(LogTemp, Log, TEXT("Session created: %s"), *SessionId);
            }
        });

    Request->ProcessRequest();
}`}
            </CodeBlock>
          </div>

          {/* Report Event */}
          <div>
            <h2 className="text-2xl font-semibold">4. Report Events</h2>
            <CodeBlock>
              {`void ASimvadoManager::ReportDecision(const FString& Choice, const FString& Context)
{
    auto Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(FString::Printf(
        TEXT("%s/api/game/sessions/%s/events"),
        *SimvadoConfig::BaseUrl, *SessionId));
    Request->SetVerb(TEXT("POST"));
    Request->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
    Request->SetHeader(TEXT("Authorization"),
        FString::Printf(TEXT("Bearer %s"), *SimvadoConfig::ApiKey));

    TSharedPtr<FJsonObject> EventData = MakeShareable(new FJsonObject);
    EventData->SetStringField(TEXT("choice"), Choice);
    EventData->SetStringField(TEXT("context"), Context);

    TSharedPtr<FJsonObject> Body = MakeShareable(new FJsonObject);
    Body->SetStringField(TEXT("eventType"), TEXT("decision"));
    Body->SetObjectField(TEXT("eventData"), EventData);

    FString BodyString;
    auto Writer = TJsonWriterFactory<>::Create(&BodyString);
    FJsonSerializer::Serialize(Body.ToSharedRef(), Writer);
    Request->SetContentAsString(BodyString);

    Request->ProcessRequest();
}`}
            </CodeBlock>
          </div>

          {/* Complete */}
          <div>
            <h2 className="text-2xl font-semibold">5. Complete Session</h2>
            <CodeBlock>
              {`void ASimvadoManager::CompleteSession(const FSimvadoScores& Scores, int32 Duration)
{
    auto Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(FString::Printf(
        TEXT("%s/api/game/sessions/%s/complete"),
        *SimvadoConfig::BaseUrl, *SessionId));
    Request->SetVerb(TEXT("POST"));
    Request->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
    Request->SetHeader(TEXT("Authorization"),
        FString::Printf(TEXT("Bearer %s"), *SimvadoConfig::ApiKey));

    TSharedPtr<FJsonObject> ScoresJson = MakeShareable(new FJsonObject);
    ScoresJson->SetNumberField(TEXT("financial"), Scores.Financial);
    ScoresJson->SetNumberField(TEXT("reputational"), Scores.Reputational);
    ScoresJson->SetNumberField(TEXT("ethical"), Scores.Ethical);
    ScoresJson->SetNumberField(TEXT("stakeholder_confidence"), Scores.StakeholderConfidence);
    ScoresJson->SetNumberField(TEXT("long_term_stability"), Scores.LongTermStability);
    ScoresJson->SetNumberField(TEXT("total"), Scores.Total);

    TSharedPtr<FJsonObject> Body = MakeShareable(new FJsonObject);
    Body->SetObjectField(TEXT("finalScores"), ScoresJson);
    Body->SetNumberField(TEXT("totalDurationSeconds"), Duration);

    FString BodyString;
    auto Writer = TJsonWriterFactory<>::Create(&BodyString);
    FJsonSerializer::Serialize(Body.ToSharedRef(), Writer);
    Request->SetContentAsString(BodyString);

    Request->OnProcessRequestComplete().BindLambda(
        [](FHttpRequestPtr Req, FHttpResponsePtr Res, bool bSuccess)
        {
            if (bSuccess && Res->GetResponseCode() == 200)
            {
                UE_LOG(LogTemp, Log, TEXT("Session completed, debrief generated."));
            }
        });

    Request->ProcessRequest();
}`}
            </CodeBlock>
          </div>

          {/* Download */}
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
            <h2 className="text-lg font-semibold mb-2">
              Download Full SDK Header
            </h2>
            <p className="text-sm text-text-muted mb-4">
              Drop-in C++ header with all methods ready to use.
            </p>
            <a
              href="/sdk/SimvadoClient.h"
              download
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition"
            >
              Download SimvadoClient.h
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
