from datetime import date


def calculate_health(client: dict) -> dict:
    score = 100
    flags = []
    opportunities = []

    pct = client.get("project_completion_pct", 0)
    payment = client.get("payment_status", "current")
    project_status = client.get("project_status", "active")

    # Communication freshness — windows scale with project phase.
    # Near-complete or completed projects naturally have longer quiet periods.
    last_contact = client.get("last_contact_date")
    if last_contact:
        try:
            last = date.fromisoformat(str(last_contact))
            days = (date.today() - last).days
            # Longer grace period for projects >= 75% complete (review / handoff phase)
            if pct >= 75:
                if days > 30:
                    score -= 25
                    flags.append(f"No contact in {days} days — check in")
                elif days > 18:
                    score -= 10
                    flags.append(f"Going quiet ({days} days since last contact)")
            else:
                if days > 21:
                    score -= 30
                    flags.append(f"No contact in {days} days — churn risk")
                elif days > 10:
                    score -= 12
                    flags.append(f"Going quiet ({days} days since last contact)")
        except ValueError:
            pass

    # Payment health
    if payment == "overdue":
        score -= 25
        flags.append("Invoice overdue — follow up today")
    elif payment == "at_risk":
        score -= 10
        flags.append("Payment at risk")

    # Project momentum — near-complete stalled projects are much less alarming
    if project_status == "stalled":
        if pct >= 75:
            score -= 8
            flags.append("Project stalled near finish line — light nudge needed")
        else:
            score -= 20
            flags.append("Project stalled — needs a check-in message")

    # Completion bonus: reward active, well-progressed projects
    if pct >= 80 and project_status == "active" and payment == "current":
        score += 5

    # Opportunity signals
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
