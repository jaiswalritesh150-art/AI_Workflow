from workflow import detect_intent, route_request


def main():

    print("================================")
    print("      AI WORKFLOW ASSISTANT")
    print("================================")

    question = input("\nAsk your question: ")

    # Step 1: Detect intent
    intent = detect_intent(question)

    print("\nDetected Intent:")
    print(intent)

    # Step 2: Route request
    response = route_request(
        question,
        intent
    )

    # Step 3: Show final response
    print("\nWorkflow Response:")
    print(response)


if __name__ == "__main__":
    main()