from datetime import date


def calculate_health(client: dict) -> dict:
    score = 100
    flags = []
    opportunities = []

    # Communication freshness
    last_contact = client.get("last_contact_date")
    if last_contact:
        try:
            last = date.fromisoformat(str(last_contact))
            days = (date.today() - last).days
            if days > 14:
                score -= 35
                flags.append(f"No contact in {days} days — churn risk")
            elif days > 7:
                score -= 15
                flags.append(f"Going quiet ({days} days since last contact)")
        except ValueError:
            pass

    # Payment health
    payment = client.get("payment_status", "current")
    if payment == "overdue":
        score -= 25
        flags.append("Invoice overdue — follow up today")
    elif payment == "at_risk":
        score -= 10
        flags.append("Payment at risk")

    # Project momentum
    if client.get("project_status") == "stalled":
        score -= 20
        flags.append("Project stalled — needs a check-in message")

    # Opportunity signals
    pct = client.get("project_completion_pct", 0)
    if pct >= 80:
        opportunities.append("Project near completion — propose Phase 2 or ask for referral")
    if pct == 100 and payment == "current":
        opportunities.append("Project complete + paid — perfect time to ask for a testimonial")

    score = max(0, min(100, score))
    status = "healthy" if score > 70 else "at_risk" if score > 40 else "critical"

    if flags:
        action = f"Send a check-in to {client.get('name', 'client')} about {client.get('project_name', 'the project')}"
    elif opportunities:
        action = f"Reach out to {client.get('name', 'client')} with a Phase 2 proposal"
    else:
        action = f"{client.get('name', 'Client')} is healthy — no action needed"

    return {
        "health_score": score,
        "health_status": status,
        "health_flags": flags,
        "opportunities": opportunities,
        "suggested_action": action,
    }
