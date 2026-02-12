from app import app, db, ModuleContent, Simulation

with app.app_context():
    # Check content 13
    content = ModuleContent.query.get(13)
    if content:
        print(f'Content ID: {content.id}')
        print(f'Title: {content.title}')
        print(f'Type: {content.content_type}')
        print(f'Simulation ID: {content.simulation_id if hasattr(content, "simulation_id") else "No simulation_id field"}')
        print(f'Fields: {[c.name for c in content.__table__.columns]}')
    else:
        print('Content 13 not found')
    
    print('\n--- All Simulations ---')
    sims = Simulation.query.all()
    print(f'Total simulations: {len(sims)}')
    for sim in sims:
        fields = [c.name for c in sim.__table__.columns]
        print(f'Simulation ID: {sim.id}, Fields: {fields}')
        print(f'  Content ID: {sim.content_id if hasattr(sim, "content_id") else "N/A"}')
