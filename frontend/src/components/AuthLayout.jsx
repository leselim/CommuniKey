import React from 'react';
import Icon from './Icon';
import Logo from './Logo';

/*
 * Frame for sign in, registration and recovery. The charcoal panel says what
 * the product is for, in plain words, and who uses it. The form sits alone
 * on the right so there is exactly one thing to do.
 */

const ROLES = [
  { icon: 'home', title: 'Residents', text: 'Issue visitor passes, report incidents and raise an SOS.' },
  { icon: 'shield', title: 'Safety volunteers', text: 'Triage alerts, respond and log patrols.' },
  { icon: 'gate', title: 'Security guards', text: 'Verify passes and record every entry at the boom.' },
  { icon: 'grid', title: 'Estate management', text: 'Verify households, publish notices and read the numbers.' },
];

function AuthLayout({ children }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <Logo />
        <div className="auth-statement">
          <p>Safety, access and community for residential estates.</p>
          <p>Four roles working from one record of what happened at the gate, on the street and in the estate office.</p>
          <div className="auth-roles">
            {ROLES.map((r) => (
              <div className="auth-role" key={r.title}>
                <Icon name={r.icon} />
                <div>
                  <strong>{r.title}</strong>
                  <span>{r.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="auth-legal">Riverside Estate demonstration workspace</p>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  );
}

export default AuthLayout;
